var envParser = require('../app/env-parser');
Error.stackTraceLimit = Infinity;
describe('parse args', function(){

    it('returns arg if required', function(){
        var env = { 'FOO': 'bar' };
        expect(envParser.parse(env, ['FOO'])).toEqual({ 'FOO': 'bar' });
    });

    it('returns arg if optional', function(){
        var env = { 'FOO': 'bar' };
        expect(envParser.parse(env)).toEqual({ 'FOO': 'bar' });
    });

    it('returns empty if empty', function(){
        var env = {};
        expect(envParser.parse(env)).toEqual({});
    });

    it('raises error if missing required', function(){
        var env = { 'FOO': 'bar' };
        expect(function() { envParser.parse(env, ['BAZ']) }).toThrow('env does not contain Set { "BAZ" }');
    });

    it('raises error if empty and missing required', function(){
        var env = {};
        expect(function() { envParser.parse(env, ['BAZ']) }).toThrow('env does not contain Set { "BAZ" }');
    });

    it('returns arg if required plus default', function(){
        var env = { 'FOO': 'bar' };
        expect(envParser.parse(env, ['FOO'], { 'BAR': 'baz' })).toEqual({ 'FOO': 'bar', 'BAR': 'baz' });
    });

    it('returns arg if optional plus default', function(){
        var env = { 'FOO': 'bar' };
        expect(envParser.parse(env,[], { 'BAR': 'baz' })).toEqual({ 'FOO': 'bar', 'BAR': 'baz' });
    });

    it('doesn\'t override with optional if param present', function(){
        var env = { 'FOO': 'bar' };
        expect(envParser.parse(env,[], { 'FOO': 'baz' })).toEqual({ 'FOO': 'bar' });
    });

    it('raises if optional param is also required', function(){
        var env = { 'FOO': 'bar' };
        expect(function(){ envParser.parse(env, ['FOO'], { 'FOO': 'baz'})}).toThrow('required keys have defaults Set { "FOO" }');
    });

    it('raises if optional param is also required and not present', function(){
        var env = {} ;
        expect(function(){ envParser.parse(env, ['FOO'], { 'FOO': 'baz'})}).toThrow('required keys have defaults Set { "FOO" }');
    });

    it('combines it all together', function(){
        var env = { a: 'first', b: 'second', c: 'third', d: 'fourth'};
        var defaults = { c: 'default', d: 'default', e: 'default'};
        expect(envParser.parse(env, ['a'], defaults)).toEqual({a: 'first', b: 'second', c: 'third', d: 'fourth', e: 'default'});
    });

    it('combines it all together with error', function(){
        var env = { a: 'first', b: 'second', c: 'third', d: 'fourth'};
        var defaults = { c: 'default', d: 'default', e: 'default'};
        expect(function(){ envParser.parse(env, ['a', 'c', 'f'], defaults)} ).toThrow();
    });
});
