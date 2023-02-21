/*
 Tests for dashboards
*/

/* eslint-disable import/no-unresolved */
require('dotenv').config();

const test = require('ava').default;
const Dashboard = require('../src/models/dashboard');
const {mongoose} = require('../src/config');

// test that a dashboard cant be created without a name
test('Create dashboard without name',async t => {
    mongoose();
    const dashboard =  await t.throwsAsync(Dashboard.create({}));
    t.is(dashboard.message,'You need to provide a name for the dashboard')
    Dashboard.deleteOne({});
});

// dashboard creation: name and passwrod are required
test('Create dashboard with name and password',async t => {
    mongoose();
    const dashboard =  await new Dashboard({name:'test',password:'test'}).save();
    t.is(dashboard.name,'test');
    t.is(dashboard.npassword),('test')
    Dashboard.deleteOne({});
});

// compare dashboard password
test('Compare dashboard passwords',async t => {
    mongoose();
    const dashboard = await new Dashboard({name:'test',password:'test'}).save(); 
    const cmp1 = dashboard.comparePassword('test');
    const cmp2 = dashboard.comparePassword('failtest');
    t.is((cmp1,cmp2),(true,false));
    Dashboard.deleteOne({});
});