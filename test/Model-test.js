var assert = require('assert'),
  bigml = require('../index');

describe('Manage model objects', function () {
  var sourceId, source = new bigml.Source(), path = './data/iris.csv',
    datasetId, dataset = new bigml.Dataset(), datasetId2,
    dataset2 = new bigml.Dataset(),
    modelId, model = new bigml.Model(), modelId2,
    model2 = new bigml.Model();

  before(function (done) {
    source.create(path, undefined, function (error, data) {
      assert.equal(data.code, bigml.constants.HTTP_CREATED);
      sourceId = data.resource;
      dataset.create(sourceId, undefined, function (error, data) {
        assert.equal(data.code, bigml.constants.HTTP_CREATED);
        datasetId = data.resource;
        dataset2.create(sourceId, undefined, function (error, data) {
          assert.equal(data.code, bigml.constants.HTTP_CREATED);
          datasetId2 = data.resource;
          done();
        });
      });
    });
  });

  describe('#create(dataset, args, callback)', function () {
    it('should create a model from a dataset', function (done) {
      model.create(datasetId, undefined, function (error, data) {
        assert.equal(data.code, bigml.constants.HTTP_CREATED);
        modelId = data.resource;
        done();
      });
    });
  });
  describe('#get(model, finished, query, callback)', function () {
    it('should retrieve a finished model', function (done) {
      model.get(modelId, true, function (error, data) {
        if (data.object.status.code === bigml.constants.FINISHED) {
          assert.ok(true);
          done();
        }
      });
    });
  });
  describe('#update(model, args, callback)', function () {
    it('should update properties in the model', function (done) {
      var newName = 'my new name';
      model.update(modelId, {name: newName}, function (error, data) {
        assert.equal(data.code, bigml.constants.HTTP_ACCEPTED);
        model.get(modelId, true, function (errorcb, datacb) {
          if (datacb.object.status.code === bigml.constants.FINISHED &&
              datacb.object.name === newName) {
            assert.ok(true);
            done();
          }
        });
      });
    });
  });
  describe('#create([dataset], args, callback)', function () {
    it('should create a model from a list of datasets ', function (done) {
      model2.create([datasetId, datasetId2], undefined,
                    function (error, data) {
        assert.equal(data.code, bigml.constants.HTTP_CREATED);
        modelId2 = data.resource;
        done();
      });
    });
  });
  describe('#delete(model, callback)', function () {
    it('should delete the remote model', function (done) {
      model.delete(modelId, function (error, data) {
        assert.equal(error, null);
        model2.delete(modelId2, function (error, data) {
          assert.equal(error, null);
          done();
        });
      });
    });
  });

  after(function (done) {
    source.delete(sourceId, function (error, data) {
      assert.equal(error, null);
      done();
    });
  });
  after(function (done) {
    dataset.delete(datasetId, function (error, data) {
      assert.equal(error, null);
      dataset2.delete(datasetId2, function (error, data) {
        assert.equal(error, null);
        done();
      });
    });
  });
});
