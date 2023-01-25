/**
 * configuration file for all the sources routes of the app
 */
/* eslint-disable max-len */
const express = require('express');
const mongoose = require('mongoose');
const {authorization} = require('../middlewares');

// initialize router
const router = express.Router();

const Source = require('../models/source');

// get sources - info (GET)
router.get('/sources',
  authorization,
  async (req, res, next) => {
    try {
      const {id} = req.decoded;
      // search for sources
      const foundSources = await Source.find({owner: mongoose.Types.ObjectId(id)});
      const sources = [];
      // gather sources
      foundSources.forEach((s) => {
        sources.push({
          id: s._id,
          name: s.name,
          type: s.type,
          url: s.url,
          login: s.login,
          passcode: s.passcode,
          vhost: s.vhost,
          active: false
        });
      });

      // send sources
      return res.json({
        success: true,
        sources
      });
    } catch (err) {
      return next(err.body);
    }
  });

// create a new source (POST)
router.post('/create-source', 
  // first give authorization
  authorization,
  async (req, res, next) => {
    try {
      const {name, type, url, login, passcode, vhost} = req.body;
      const {id} = req.decoded;
      // check if there's already a source with the same name
      const foundSource = await Source.findOne({owner: mongoose.Types.ObjectId(id), name});
      if (foundSource) {
        return res.json({
          status: 409,
          message: 'A source with that name already exists.'
        });
      }

      // create new source
      await new Source({
        name,
        type,
        url,
        login,
        passcode,
        vhost,
        owner: mongoose.Types.ObjectId(id)
      }).save();

      // successful creation
      return res.json({success: true});
    } catch (err) {
      return next(err.body);
    }
  }); 

// make changes to source (POST)
router.post('/change-source', 
  // first give authorization
  authorization,
  async (req, res, next) => {
    try {
      const {id, name, type, url, login, passcode, vhost} = req.body;
      const foundSource = await Source.findOne({_id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id)});
      // there's no such source
      if (!foundSource) {
        return res.json({
          status: 409,
          message: 'The selected source has not been found.'
        });
      }
      
      // check if the new name is already taken
      const sameNameSources = await Source.findOne({_id: {$ne: mongoose.Types.ObjectId(id)}, owner: mongoose.Types.ObjectId(req.decoded.id), name});
      if (sameNameSources) {
        return res.json({
          status: 409,
          message: 'A source with the same name has been found.'
        });
      }

      // change the source's info
      foundSource.name = name;
      foundSource.type = type;
      foundSource.url = url;
      foundSource.login = login;
      foundSource.passcode = passcode;
      foundSource.vhost = vhost;
      await foundSource.save();

      // successful info change
      return res.json({success: true});
    } catch (err) {
      return next(err.body);
    }
  }); 

// delete a source (POST)
router.post('/delete-source', 
  authorization,
  async (req, res, next) => {
    try {
      const {id} = req.body;

      // find and delete the source
      const foundSource = await Source.findOneAndRemove({_id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id)});
      // no such source
      if (!foundSource) {
        return res.json({
          status: 409,
          message: 'The selected source has not been found.'
        });
      }

      // successful deletion
      return res.json({success: true});
    } catch (err) {
      return next(err.body);
    }
  }); 

// select a source (POST)
router.post('/source',
  async (req, res, next) => {
    try {
      const {name, owner, user} = req.body;
      const userId = (owner === 'self') ? user.id : owner;
      const foundSource = await Source.findOne({name, owner: mongoose.Types.ObjectId(userId)});
      // no such source
      if (!foundSource) {
        return res.json({
          status: 409,
          message: 'The selected source has not been found.'
        });
      }

      // found the source
      const source = {};
      source.type = foundSource.type;
      source.url = foundSource.url;
      source.login = foundSource.login;
      source.passcode = foundSource.passcode;
      source.vhost = foundSource.vhost;
    
      // return the source
      return res.json({
        success: true,
        source
      });
    } catch (err) {
      return next(err.body);
    }
  });

// check the existing sources (POST)
router.post('/check-sources',
  // first make the authorization
  authorization,
  async (req, res, next) => {
    try {
      const {sources} = req.body;
      const {id} = req.decoded;

      const newSources = [];

      // search for sources
      for (let i = 0; i < sources.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const result = await Source.findOne({name: sources[i], owner: mongoose.Types.ObjectId(id)});
        if (!result) {
          newSources.push(sources[i]);
        }
      }

      // gather the sources
      for (let i = 0; i < newSources.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await new Source({
          name: newSources[i],
          type: 'stomp',
          url: '',
          login: '',
          passcode: '',
          vhost: '',
          owner: mongoose.Types.ObjectId(id)
        }).save();
      } 
      
      // send new sources
      return res.json({
        success: true,
        newSources
      });
    } catch (err) {
      return next(err.body);
    }
  });

module.exports = router;
