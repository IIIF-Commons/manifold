import { loadManifestJson } from '../src';
import { ExternalResource } from '../src/ExternalResource';

const blAvAuthNew = require('./fixtures/bl-av-auth.json');
const blAvAuth = require('./fixtures/prev-auth.json');


function mockFetch(status: number, data?: any) {
  const xhrMockObj = {
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
    readyState: 4,
    status,
    response: JSON.stringify(data),
    responseText: JSON.stringify(data),
  };

  const xhrMockClass = () => xhrMockObj;

  // @ts-ignore
  window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass);

  setTimeout(() => {
    if (xhrMockObj['onload']) {
      // @ts-ignore
      xhrMockObj['onload']();
    }
  }, 0);
}

describe('Helper', () => {


  test('New format works using service profile', async () => {

    const helper = await loadManifestJson(blAvAuthNew, {
      manifestUri: blAvAuth.id
    });

    expect(helper).toBeDefined();

    const canvas = helper.getCanvasByIndex(0);

    expect(canvas).toBeDefined();

    const externalResource = new ExternalResource(canvas, {
      authApiVersion: 1,
    });

    mockFetch(200, {
      contentLocation: externalResource.dataUri,
    });

    expect(externalResource).toBeDefined();

    expect(externalResource.hasServiceDescriptor()).toBe(false);

    await externalResource.getData();

    expect(externalResource.loginService).not.toBe(null);
    expect(externalResource.probeService).not.toBe(null);
    expect(externalResource.tokenService).not.toBe(null);
    expect(externalResource.dataUri).not.toBe(null);
    expect(externalResource.isProbed).toBe(true);
    expect(externalResource.isResponseHandled).toBe(false);

  })

  test('previous format still works using service profile', async () => {

    const helper = await loadManifestJson(blAvAuth, {
      manifestUri: blAvAuth.id
    });

    expect(helper).toBeDefined();

    const canvas = helper.getCanvasByIndex(0);

    expect(canvas).toBeDefined();

    const externalResource = new ExternalResource(canvas, {
      authApiVersion: 1,
    });

    mockFetch(200, {
      contentLocation: externalResource.dataUri,
    });

    expect(externalResource).toBeDefined();

    expect(externalResource.hasServiceDescriptor()).toBe(false);

    await externalResource.getData();

    expect(externalResource.loginService).not.toBe(null);
    expect(externalResource.probeService).not.toBe(null);
    expect(externalResource.tokenService).not.toBe(null);
    expect(externalResource.dataUri).not.toBe(null);
    expect(externalResource.isProbed).toBe(true);
    expect(externalResource.isResponseHandled).toBe(false);

  })

});
