var Im = require('immutable');
Error.stackTraceLimit = Infinity;

exports.parse = function(env, required, defaultHash){
    var envList = Im.Map(env);
    var requiredSet = Im.Set(required);
    var defaultMap = Im.Map(defaultHash);
    var requiredDefaultIntersect = Im.List(defaultMap.keys()).toSet().intersect(requiredSet);
    if(requiredDefaultIntersect.count() > 0) {
        throw 'required keys have defaults ' + requiredDefaultIntersect
    }
    var diff = requiredSet.subtract(envList.keys());
    if(diff.count() > 0) {
        throw 'env does not contain ' + diff;
    }
    var result = Im.Map(defaultHash).merge(envList);
    return result.toJS();
};