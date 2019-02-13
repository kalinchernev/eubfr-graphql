"use strict";

require("@babel/polyfill");

var _awsSdk = _interopRequireDefault(require("aws-sdk"));

var _elasticsearch = _interopRequireDefault(require("elasticsearch"));

var _httpAwsEs = _interopRequireDefault(require("http-aws-es"));

var _graphql = require("graphql");

var _graphqlComposeElasticsearch = require("graphql-compose-elasticsearch");

var _apolloServer = require("apollo-server");

var _project = _interopRequireDefault(require("./mappings/project"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var projectMapping = (0, _project.default)();

_awsSdk.default.config.update({
  region: "eu-central-1"
});

_asyncToGenerator(
/*#__PURE__*/
regeneratorRuntime.mark(function _callee() {
  var accessKeyId, secretAccessKey, secretsManager, secretsResponse, secrets, id, key, elasticClient, ProjectTC, schema, server;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          accessKeyId = "";
          secretAccessKey = "";
          secretsManager = new _awsSdk.default.SecretsManager();
          _context.next = 5;
          return secretsManager.getSecretValue({
            SecretId: "services/elastic-graphql"
          }).promise();

        case 5:
          secretsResponse = _context.sent;
          secrets = JSON.parse(secretsResponse.SecretString);
          id = secrets.AWS_ACCESS_KEY_ID, key = secrets.AWS_SECRET_ACCESS_KEY;
          accessKeyId = id;
          secretAccessKey = key;
          elasticClient = new _elasticsearch.default.Client({
            host: "https://search-test-public-ip4o6f4o6ziykrbjm4kdpyosfu.eu-central-1.es.amazonaws.com/",
            connectionClass: _httpAwsEs.default,
            awsConfig: new _awsSdk.default.Config({
              accessKeyId: accessKeyId,
              secretAccessKey: secretAccessKey,
              region: "eu-central-1"
            }),
            apiVersion: "6.3",
            trace: true
          });
          ProjectTC = (0, _graphqlComposeElasticsearch.composeWithElastic)({
            apiVersion: "6.3",
            graphqlTypeName: "Project",
            elasticIndex: "test-projects",
            elasticType: "project",
            elasticMapping: projectMapping.mappings.project,
            elasticClient: elasticClient,
            pluralFields: ["ec_priorities", "media", "project_locations", "related_links", "themes", "third_parties", "type"]
          });
          schema = new _graphql.GraphQLSchema({
            query: new _graphql.GraphQLObjectType({
              name: "Query",
              fields: {
                projectById: ProjectTC.getResolver("findById").getFieldConfig(),
                projects: ProjectTC.getResolver("search").getFieldConfig(),
                projectsPagination: ProjectTC.getResolver("searchPagination").getFieldConfig()
              }
            })
          });
          server = new _apolloServer.ApolloServer({
            schema: schema,
            introspection: true,
            tracing: true
          });
          server.listen().then(function (_ref2) {
            var url = _ref2.url;
            console.log("\uD83D\uDE80 Server ready at ".concat(url));
          });

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
}))();