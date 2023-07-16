const sinon = require("sinon");
const { expect } = require("chai");
const { cache, invalidateCache } = require("../../../utils/cache");

const { dummyResponse } = require("../../fixtures/cache/cache");

const responseBody = JSON.stringify(dummyResponse);

describe("Middleware | Utils | cache", function () {
  afterEach(function () {
    sinon.restore();
  });
  it("should cache the response", async function () {
    const cacheTestKey = "__cache__1";

    const request = {
      method: "GET",
      originalUrl: "/test1",
    };

    const response = {
      send: sinon.spy(),
    };

    const nextSpy = sinon.spy();

    const cacheMiddleware = cache({ invalidationKey: cacheTestKey });

    cacheMiddleware(request, response, nextSpy);

    response.send(responseBody);

    expect(nextSpy.callCount).to.equal(1);
    expect(response.send.callCount).to.equal(1);

    await cacheMiddleware(request, response, nextSpy);

    expect(nextSpy.callCount).to.equal(1);
    expect(response.send.callCount).to.equal(2);
  });

  it("should invalidate stale the response", async function () {
    const cacheTestKey = "__cache__2";

    const request = {
      method: "GET",
      originalUrl: "/test2",
    };
    const response = {
      send: sinon.spy(),
    };

    const nextSpy = sinon.spy();

    const cacheMiddlewareForCache = cache({ invalidationKey: cacheTestKey });

    cacheMiddlewareForCache(request, response, nextSpy);

    response.send(responseBody);

    expect(nextSpy.callCount).to.equal(1);
    expect(response.send.callCount).to.equal(1);

    const cacheMiddlewareForInvalidation = invalidateCache({ invalidationKeys: [cacheTestKey] });

    cacheMiddlewareForInvalidation(request, response, nextSpy);
    response.send(responseBody);

    expect(nextSpy.callCount).to.equal(2);
    expect(response.send.callCount).to.equal(2);

    cacheMiddlewareForCache(request, response, nextSpy);
    response.send(responseBody);

    expect(nextSpy.callCount).to.equal(3);
    expect(response.send.callCount).to.equal(3);
  });
});
