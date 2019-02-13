import "@babel/polyfill";

import AWS from "aws-sdk";

import elasticsearch from "elasticsearch";
import connectionClass from "http-aws-es";
import { GraphQLSchema, GraphQLObjectType } from "graphql";
import { composeWithElastic } from "graphql-compose-elasticsearch";
import { ApolloServer } from "apollo-server";

import getProjectMapping from "./mappings/project";

const projectMapping = getProjectMapping();

AWS.config.update({ region: "eu-central-1" });

(async () => {
  let accessKeyId = "";
  let secretAccessKey = "";

  const secretsManager = new AWS.SecretsManager();
  const secretsResponse = await secretsManager
    .getSecretValue({ SecretId: "services/elastic-graphql" })
    .promise();

  const secrets = JSON.parse(secretsResponse.SecretString);

  const { AWS_ACCESS_KEY_ID: id, AWS_SECRET_ACCESS_KEY: key } = secrets;

  accessKeyId = id;
  secretAccessKey = key;

  const elasticClient = new elasticsearch.Client({
    host:
      "https://search-test-public-ip4o6f4o6ziykrbjm4kdpyosfu.eu-central-1.es.amazonaws.com/",
    connectionClass,
    awsConfig: new AWS.Config({
      accessKeyId,
      secretAccessKey,
      region: "eu-central-1"
    }),
    apiVersion: "6.3",
    trace: true
  });

  const ProjectTC = composeWithElastic({
    apiVersion: "6.3",
    graphqlTypeName: "Project",
    elasticIndex: "test-projects",
    elasticType: "project",
    elasticMapping: projectMapping.mappings.project,
    elasticClient,
    pluralFields: [
      "ec_priorities",
      "media",
      "project_locations",
      "related_links",
      "themes",
      "third_parties",
      "type"
    ]
  });

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: "Query",
      fields: {
        projectById: ProjectTC.getResolver("findById").getFieldConfig(),
        projects: ProjectTC.getResolver("search").getFieldConfig(),
        projectsPagination: ProjectTC.getResolver(
          "searchPagination"
        ).getFieldConfig()
      }
    })
  });

  const server = new ApolloServer({
    schema,
    introspection: true,
    tracing: true
  });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();
