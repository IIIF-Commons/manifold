import { loadManifestJson } from '../src';
import { ExternalResource } from '../src/ExternalResource';

const blAvAuthNew = require('./fixtures/bl-av-auth.json');
const blAvAuth = require('./fixtures/prev-auth.json');
const utexasRightsLogoReqStatement = require('./fixtures/utexas-rights-logo-reqStatement.json');
const searchService2 = require('./fixtures/search-service-2.json');

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

    test('Search Service 2 got from manifest', async () => {
    const helper = await loadManifestJson(searchService2, {
      manifestUri: searchService2.id
    });

    expect(helper).toBeDefined();

    const searchService = helper.getSearchService();

    expect(searchService).toBeDefined();
    if (searchService) {
      expect(searchService.id).toBe('https://bl-annosearch.onrender.com/m0001/search');
    };
  })

  const v3metadataFixture = utexasRightsLogoReqStatement;

  test('Rights got from v3 manifest', async () => {
    const helper = await loadManifestJson(v3metadataFixture, {
      manifestUri: v3metadataFixture.id
    });

    expect(helper).toBeDefined();

    const rights = helper.getRights();

    expect(rights).toBeDefined();
    expect(rights).toBe('http://rightsstatements.org/vocab/InC/1.0/');
  })

  test('Required Statement got from v3 manifest', async () => {
    const helper = await loadManifestJson(v3metadataFixture, {
      manifestUri: v3metadataFixture.id
    });

    expect(helper).toBeDefined();

    const reqStatement = helper.getRequiredStatement();

    expect(reqStatement).toBeDefined();

    if (reqStatement) {
      expect(reqStatement.value).toBe("This material is made available for education and research purposes. The Harry Ransom Center does not own the rights for this item; it cannot grant or deny permission to use this material.  Copyright law protects unpublished as well as published materials. Rights holders for these materials may be listed in the WATCH file: http://norman.hrc.utexas.edu/watch/.  It is your responsibility to determine the rights status and secure whatever permission may be needed for the use of this item.")
    }
  })

  test('Logo got from v3 manifest', async () => {
    const helper = await loadManifestJson(v3metadataFixture, {
      manifestUri: v3metadataFixture.id
    });

    expect(helper).toBeDefined();

    const logo = helper.getLogo();
    expect(logo).toBeDefined();
    expect(logo).toBe("https://norman.hrc.utexas.edu/includes/images/hrc-logo-iiif.jpg");
  })

  test('v3 metadata group includes rights, logo, requiredStatement', async () => {
    const helper = await loadManifestJson(v3metadataFixture, {
      manifestUri: v3metadataFixture.id
    });

    expect(helper).toBeDefined();

    const metadataGroups = helper.getMetadata();

    const hasRights = metadataGroups.some(metadataGroup => 
      metadataGroup.items.some(item => item.getLabel() === 'rights'))

    expect(hasRights).toBe(true);

    const hasLogo = metadataGroups.some(metadataGroup => 
      metadataGroup.items.some(item => item.getLabel() === 'logo'))

    expect(hasLogo).toBe(true);

    const hasReqStatement = metadataGroups.some(metadataGroup => 
      metadataGroup.items.some(item => item.getLabel() === 'Rights Note'))

    expect(hasReqStatement).toBe(true);

  })

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
