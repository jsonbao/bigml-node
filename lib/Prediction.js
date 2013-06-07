/**
 * Copyright 2012 BigML
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

"use strict";

var BigML = require('./BigML');
var Resource = require('./Resource');
var Ensemble = require('./Ensemble');
var LocalModel = require('./LocalModel');
var constants = require('./constants');
var logger = require('./logger');
var utils = require('./utils');

function Prediction(connection) {
  Resource.call(this, connection);
}

Prediction.prototype = new Resource();

Prediction.prototype.parent = Resource.prototype;

Prediction.prototype.create = function (modelOrEnsemble, inputData, args, cb) {
  /**
   * Creates a prediction and builds customized error and resource info
   *
   * Uses HTTP POST to send dataset content.
   *
   * Returns a BigML resource wrapped in an object that includes
   *   code: HTTP status code
   *   resource: The resource/id
   *   location: Remote location of the resource
   *   object: The resource itself
   *   error: An error code and message
   *
   */

  var message = 'Failed to create the prediction. First parameter must be' +
                ' a model or an ensemble id.',
    resourceId = utils.getResource(modelOrEnsemble),
    self = this,
    modelId,
    ensemble,
    model;
  if (!args) {
    args = {};
  }
  if (!inputData) {
    inputData = {};
  }

  function createRemotePrediction(self, model, inputData, args, cb) {
    args['input_data'] = model.validateInput(inputData);
    self.parent.create.call(self, 'prediction', ['model', 'ensemble'], message,
                            model.resourceId.resource, args, cb);
  }

  function createEnsembleModel(error, data) {
    model = new LocalModel(data.object.models[0]);
    model.on('ready', function () {
      createRemotePrediction(self, model, inputData, args, cb);
    });
  }

  if (resourceId.type === 'ensemble') {
    if (modelOrEnsemble.object && modelOrEnsemble.object.models) {
      model = new LocalModel(modelOrEnsemble.object.models[0]);
      model.on('ready', function () {
        createRemotePrediction(self, model, inputData, args, cb);
      });
    } else {
      ensemble = new Ensemble(this.connection);
      ensemble.get(resourceId.resource, createEnsembleModel);
    }
  } else {
    model = new LocalModel(resourceId.resource);
    model.on('ready', function () {
      createRemotePrediction(self, model, inputData, args, cb);
    });
  }
};

Prediction.prototype.list = function (query, cb) {
  this.parent.list.call(this, 'prediction', query, cb);
};


module.exports = Prediction;