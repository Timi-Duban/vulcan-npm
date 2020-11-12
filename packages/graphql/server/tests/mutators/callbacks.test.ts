import { createModel } from "@vulcanjs/model";
import extendModel from "../../../extendModel";
import { VulcanGraphqlModel } from "../../../typings";
import { createMutator } from "../../resolvers/mutators";
import { Connector } from "../../resolvers/typings";
import merge from "lodash/merge";

const schema = {
  _id: {
    type: String,
    canRead: ["guests"],
    optional: true,
  },
  createdAfter: {
    optional: true,
    type: Number,
    canRead: ["guests"],
  },
  createdBefore: {
    optional: true,
    type: Number,
    canRead: ["guests"],
  },
};
const defaultModelOptions = {
  schema,
  name: "Foo",
};
const Foo = createModel({
  ...defaultModelOptions,
  extensions: [extendModel({ typeName: "Foo", multiTypeName: "Foos" })],
}) as VulcanGraphqlModel;
describe("graphql/resolvers/mutators callbacks", function () {
  describe("create callbacks", () => {
    // create fake context
    const defaultPartialContext: {
      Foo: { connector: Partial<Connector> };
    } = {
      Foo: {
        connector: {
          create: async () => ({ _id: "1" }),
          findOneById: async () => ({
            id: "1",
          }),
          findOne: async () => ({ id: "1" }),
          update: async () => ({ id: "1" }),
        },
      },
    };
    const defaultArgs = {
      model: Foo,
      data: {},
      validate: false,
      // we test while being logged out
      asAdmin: false,
      currentUser: null,
    };
    const createArgs = {
      ...defaultArgs,
    };
    // before
    test.skip("run before callback before document is saved", function () {
      // TODO get the document in the database
    });
    //after
    const modelGraphqlOptions = {
      typeName: "Foo",
      multiTypeName: "Foos",
    };
    describe("after", () => {
      test("run asynchronous 'after' callback before document is returned", async function () {
        const after = jest.fn(async (doc) => ({ ...doc, createdAfter: 1 }));
        const create = jest.fn(async (model, data) => ({ _id: 1, ...data }));
        const Foo = createModel({
          schema,
          name: "Foo",
          extensions: [
            extendModel(
              merge({}, modelGraphqlOptions, {
                callbacks: {
                  create: {
                    after: [after],
                  },
                },
              })
            ),
          ],
        }) as VulcanGraphqlModel;
        const context = merge({}, defaultPartialContext, {
          Foo: { model: Foo, connector: { create } },
        });
        const data = {};
        const { data: resultDocument } = await createMutator({
          ...createArgs,
          model: Foo,
          context,
          data,
        });
        expect((create.mock.calls[0] as any)[1]).toEqual(data); // callback is NOT yet acalled
        expect(after).toHaveBeenCalledTimes(1);
        expect(resultDocument.createdAfter).toBe(1); // callback is called
      });
    });
    describe("before", () => {
      test("run asynchronous 'before' callback before document is saved", async function () {
        const before = jest.fn(async (doc) => ({ ...doc, createdBefore: 1 }));
        const create = jest.fn(async (model, data) => ({ _id: 1, ...data }));
        const Foo = createModel({
          schema,
          name: "Foo",
          extensions: [
            extendModel(
              merge({}, modelGraphqlOptions, {
                callbacks: {
                  create: {
                    before: [before],
                  },
                },
              })
            ),
          ],
        }) as VulcanGraphqlModel;
        const context = merge({}, defaultPartialContext, {
          Foo: { model: Foo, connector: { create } },
        });
        const data = {};
        const { data: resultDocument } = await createMutator({
          ...createArgs,
          model: Foo,
          context,
          data,
        });
        expect((create.mock.calls[0] as any)[1]).toEqual({
          ...data,
          createdBefore: 1,
        }); // callback is called already
        expect(before).toHaveBeenCalledTimes(1);
        expect(resultDocument.createdBefore).toBe(1); // callback is called
      });
    });
    describe("async", () => {
      test("run asynchronous side effect", async () => {
        // NOTE: if this test fails because of timeout => it means the mutator is waiting, while it should not
        const asyncLong = jest.fn(
          () =>
            new Promise((resolve, reject) =>
              setTimeout(() => resolve(true), 10000)
            )
        );
        const Foo = createModel({
          ...defaultModelOptions,
          extensions: [
            extendModel(
              merge({}, modelGraphqlOptions, {
                callbacks: {
                  create: {
                    async: [asyncLong],
                  },
                },
              })
            ),
          ],
        }) as VulcanGraphqlModel;
        const context = merge({}, defaultPartialContext, {
          Foo: { model: Foo },
        });
        const data = {};
        const { data: resultDocument } = await createMutator({
          ...createArgs,
          model: Foo,
          context,
          data,
        });
        expect(asyncLong).toHaveBeenCalledTimes(1);
      });
    });
    describe("validate", () => {
      test("return a custom validation error", async () => {
        const validate = jest.fn(() => ["ERROR"]);
        const Foo = createModel({
          ...defaultModelOptions,
          extensions: [
            extendModel(
              merge({}, modelGraphqlOptions, {
                callbacks: {
                  create: {
                    validate: [validate],
                  },
                },
              })
            ),
          ],
        }) as VulcanGraphqlModel;
        const context = merge({}, defaultPartialContext, {
          Foo: { model: Foo },
        });
        const data = {};

        expect.assertions(1); // should throw 1 exception
        try {
          const { data: resultDocument } = await createMutator({
            ...createArgs,
            model: Foo,
            context,
            data,
            validate: true, // enable document validation
          });
        } catch (e) {}
        expect(validate).toHaveBeenCalledTimes(1);
      });
    });
  });
});
