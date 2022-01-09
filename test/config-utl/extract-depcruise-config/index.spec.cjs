const path = require("path");
const { expect } = require("chai");
const loadConfig = require("../../../src/config-utl/extract-depcruise-config");
const fixture = require("./__mocks__/rules.sub-not-allowed-error.json");
const mergedFixture = require("./__mocks__/extends/merged.json");
const mergedArrayOneFixture = require("./__mocks__/extends/merged-array-1.json");
const mergedArrayTwoFixture = require("./__mocks__/extends/merged-array-2.json");

const mockDirectory = path.join(__dirname, "__mocks__");

describe("[I] config-utl/compile-config", () => {
  it("a rule set without an extends returns just that rule set", () => {
    expect(
      loadConfig(path.join(mockDirectory, "rules.sub-not-allowed-error.json"))
    ).to.deep.equal(fixture);
  });

  it("a rule set with an extends returns that rule set, extending the mentioned base", () => {
    expect(
      loadConfig(path.join(mockDirectory, "extends/extending.json"))
    ).to.deep.equal(mergedFixture);
  });

  it("a rule set with an extends array (0 members) returns that rule set", () => {
    expect(
      loadConfig(
        path.join(
          mockDirectory,
          "extends/extending-array-with-zero-members.json"
        )
      )
    ).to.deep.equal({
      forbidden: [
        {
          name: "rule-from-the-base",
          from: {},
          to: {},
        },
      ],
    });
  });

  it("a rule set with an extends array (1 member) returns that rule set, extending the mentioned base", () => {
    expect(
      loadConfig(
        path.join(mockDirectory, "extends/extending-array-with-one-member.json")
      )
    ).to.deep.equal(mergedArrayOneFixture);
  });

  it("a rule set with an extends array (>1 member) returns that rule set, extending the mentioned bases", () => {
    expect(
      loadConfig(
        path.join(
          mockDirectory,
          "extends/extending-array-with-two-members.json"
        )
      )
    ).to.deep.equal(mergedArrayTwoFixture);
  });

  it("a rule set with an extends from node_modules gets merged properly as well", () => {
    expect(
      loadConfig(
        path.join(mockDirectory, "extends/extending-from-node-modules.json")
      )
    ).to.deep.equal({
      allowed: [
        {
          from: {
            path: "src",
          },
          to: {
            path: "src",
          },
        },
      ],
      allowedSeverity: "warn",
      options: {
        doNotFollow: "node_modules",
      },
    });
  });

  it("borks on a circular extends (1 step)", () => {
    const lMessageOutTake = `config is circular - ${path.join(
      mockDirectory,
      "extends/circular-one.js"
    )} -> ${path.join(mockDirectory, "extends/circular-two.js")} -> ${path.join(
      mockDirectory,
      "extends/circular-one.js"
    )}.`;

    expect(() => {
      loadConfig(path.join(mockDirectory, "extends/circular-one.js"));
    }).to.throw(lMessageOutTake);
  });
});
