import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { saveFile, loadFile, reset } from './routes';


describe('routes', function() {

  it('saveFile', function() {

    //Successful save domain, test 1
    const req1 = httpMocks.createRequest({method:'POST', url:'/api/save', query: {name: ''}, body: {content: 'content1'}});
    const res1 = httpMocks.createResponse();
    saveFile(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getJSONData(), '1');



    //Successful save domain, test 2
    const req2 = httpMocks.createRequest({method:'POST', url:'/api/save', query: {name: '2'}, body: {content: 'content2'}});
    const res2 = httpMocks.createResponse();
    saveFile(req2, res2);
    assert.deepStrictEqual(res2._getStatusCode(), 200);
    assert.deepStrictEqual(res2._getJSONData(), 'Saved');

    reset();

    //Invalid name domain, test 1
    const req3 = httpMocks.createRequest({method:'POST', url:'/api/save', query: {name: undefined}, body: {content: 'content2'}});
    const res3 = httpMocks.createResponse();
    saveFile(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getJSONData(), "invalid 'draftID' parameter");

    reset();

    //invalid name domain, test 2
    const req4 = httpMocks.createRequest({method:'POST', url:'/api/save', query: {name: 5}, body: {content: 'content2'}});
    const res4 = httpMocks.createResponse();
    saveFile(req4, res4);
    assert.deepStrictEqual(res4._getStatusCode(), 400);
    assert.deepStrictEqual(res4._getJSONData(), "invalid 'draftID' parameter");

    reset();
    //Invalid body domain, test 1
    const req5 = httpMocks.createRequest({method:'POST', url:'/api/save', query: {name: '3'}, body: {content: undefined}});
    const res5 = httpMocks.createResponse();
    saveFile(req5, res5);
    assert.deepStrictEqual(res5._getStatusCode(), 400);
    assert.deepStrictEqual(res5._getJSONData(), "invalid 'draft' parameter");

    reset();

    //Invalid body domain, test 2
    const req6 = httpMocks.createRequest({method:'POST', url:'/api/save', query: {name: '4'}, body: {content: 6}});
    const res6 = httpMocks.createResponse();
    saveFile(req6, res6);
    assert.deepStrictEqual(res6._getStatusCode(), 400);
    assert.deepStrictEqual(res6._getJSONData(), "invalid 'draft' parameter");

    reset();

  });

  it('loadFile', function() {

    //Successful load domain, test 1
    const saveReq1 = httpMocks.createRequest({method:'POST', url:'/api/save', query: {name:''}, body: {content: 'content1'}});
    const saveRes1 = httpMocks.createResponse();
    saveFile(saveReq1, saveRes1);
    assert.deepStrictEqual(saveRes1._getStatusCode(), 200);
    assert.deepStrictEqual(saveRes1._getJSONData(), '1');
  
    const loadReq1 = httpMocks.createRequest({method:'GET', url:'/api/load', query: {name: '1'}});
    const loadRes1 = httpMocks.createResponse();
    loadFile(loadReq1, loadRes1);
    assert.deepStrictEqual(loadRes1._getStatusCode(), 200);
    assert.deepStrictEqual(loadRes1._getJSONData(), 'content1');

    reset();

    //Successful load domain, test 2
    const saveReq2 = httpMocks.createRequest({method:'POST', url:'/api/save', query: {name:'test2'}, body: {content: 'content2'}});
    const saveRes2 = httpMocks.createResponse();
    saveFile(saveReq2, saveRes2);
    assert.deepStrictEqual(saveRes2._getStatusCode(), 200);
    assert.deepStrictEqual(saveRes2._getJSONData(), 'Saved');
  
    const loadReq2 = httpMocks.createRequest({method:'GET', url:'/api/load', query: {name: 'test2'}});
    const loadRes2 = httpMocks.createResponse();
    loadFile(loadReq2, loadRes2);
    assert.deepStrictEqual(loadRes2._getStatusCode(), 200);
    assert.deepStrictEqual(loadRes2._getJSONData(), 'content2');

    reset();

    //Invalid name domain, test 1
    const saveReq3 = httpMocks.createRequest({method:'POST', url:'/api/save', query: {name:'test3'}, body: {content: 'content3'}});
    const saveRes3 = httpMocks.createResponse();
    saveFile(saveReq3, saveRes3);
    assert.deepStrictEqual(saveRes3._getStatusCode(), 200);
    assert.deepStrictEqual(saveRes3._getJSONData(), 'Saved');
  
    const loadReq3 = httpMocks.createRequest({method:'GET', url:'/api/load', query: {name: undefined}});
    const loadRes3 = httpMocks.createResponse();
    loadFile(loadReq3, loadRes3);
    assert.deepStrictEqual(loadRes3._getStatusCode(), 400);
    assert.deepStrictEqual(loadRes3._getJSONData(), "invalid 'draftid' parameter");

    reset();

    //Invalid name domain, test 2
    const saveReq4 = httpMocks.createRequest({method:'POST', url:'/api/save', query: {name: 'test4'}, body: {content: 'content4'}});
    const saveRes4 = httpMocks.createResponse();
    saveFile(saveReq4, saveRes4);
    assert.deepStrictEqual(saveRes4._getStatusCode(), 200);
    assert.deepStrictEqual(saveRes4._getJSONData(), 'Saved');
  
    const loadReq4 = httpMocks.createRequest({method:'GET', url:'/api/load', query: {name: 'not_test4'}});
    const loadRes4 = httpMocks.createResponse();
    loadFile(loadReq4, loadRes4);
    assert.deepStrictEqual(loadRes4._getStatusCode(), 400);
    assert.deepStrictEqual(loadRes4._getJSONData(), "Draft ID doesn't exist");

    reset();
  });

});
