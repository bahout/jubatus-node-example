/**
 * Created by nicolasbahout on 20/03/15.
 */

var jubatus = require("jubatus"),
    lineReader = require('line-reader'),
    async = require('async'),
    Promise = require('bluebird')

var config = require('./config.js'),
    concurrency = config.concurrency || 5,
    bufferTimeOut = config.bufferTimeOut || 400,
    isDebugEnabled = config.isDebugEnabled || true,
    trainingFile = config.trainingFile || './language-training.txt',
    testFile = config.testFile || './language-test.txt',
    classifier = new jubatus.classifier.client.Classifier(config.jubatus_port, config.jubatus_ip);
var name = config.name;

var debug = isDebugEnabled ? function (x) {
    console.error('TUTORIAL:', x);
} : function () {
};


readLines(trainingFile, trainEachData)
    .then(function () {
        console.log('==============> test training data')
        return readLines(testFile, dataClassifier)
    })
//.then(showResult(data))


/*************
 * Read line one by one
 * @returns {bluebird}
 *************/
function readLines(file, lineProcess) {
    var deferred = Promise.defer();

    var q = async.queue(lineProcess, concurrency);


    lineReader.eachLine(file, lineTreatement)
        .then(function () {
            console.log('end of read')
            q.drain = function () {
                debug('last trained')
                deferred.resolve();
            }
            deferred.resolve();

        })

    function lineTreatement(line, last, cb) {
        //console.log('line', line)
        var task = {name: name, line: line}
        q.push(task, function (err) {
            //debug('finished processing ' + task.line);
        });

        if (last) {
            console.log('last line')
        }
        //console.log('last is now')


        var buffer = function () {
            //debug('I have ' + q.length() + ' jobs')
            if (q.length() <= concurrency) {
                cb()
            }
            else {
                //I have to sleep
                setTimeout(function () {
                    buffer()
                }, bufferTimeOut);
            }
        };
        buffer()
    }

    return deferred.promise;


}


/*****************
 * send data To API on by one
 *
 * var name = "sample",
 * data = [
 * ["french", [[["message", "coucou c'est moi"]], []]],
 * ["english", [[["message", "hello word"]], []]]];
 *****************/
function trainEachData(data, cb) {
    var data = transformToDataUm(data);
    classifier.train(name, data, function (error, result) {
        try {
            if (error) {
                throw error;
            }
        }
        catch (e) {

        }
        //debug(data + '============> trained')
        cb(result)
    });
}


/*******************
 * Classify new data
 * @returns {bluebird}
 *
 *
 ******************/
function dataClassifier(data, cb) {
    var deferred = Promise.defer();
    var __ret = extractedTestingData(data);

    var label = __ret.label
    // (function (label) {
    classifier.classify(name, __ret.testingData, function (error, result) {
        if (error) {
            throw error;
        }
        result.forEach(function (estimateResults) {
            var mostLikely = estimateResults
                .map(function (estimateResult) {
                    return {correctLabel: label, predictLabel: estimateResult[0], score: estimateResult[1]};
                })
                .reduce(function (previous, current) {
                    return previous.score > current.score ? previous : current;
                }, {label: null, score: NaN});
            //console.log(mostLikely)
            cb(mostLikely)
            showResult(mostLikely)
        });
    })
    //})(__ret.label);
    return deferred.promise
}

function showResult(mostLikely) {
    return console.log("estimate = %j", mostLikely)
}


function transformToDataUm(data) {
    var line = data.line
    var arrLine = line.split('", "')
    var label = arrLine[0].replace(/"/, '')
    var content = arrLine[1]
    var data = [
        [label, [[["message", content]], []]]]
    return data;
}


function extractedTestingData(data) {
    var line = data.line
    var arrLine = line.split('", "')
    var label = arrLine[0].replace(/"/, '')
    var content = arrLine[1]

    var testingData = [[[["message", content]], []]];
    return {
        label: label,
        testingData: testingData
    };
}