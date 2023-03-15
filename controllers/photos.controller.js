const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');
const requestIp = require('request-ip');
const { find } = require('../models/photo.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if(title && author && email && file) { // if fields are not empty...

      const authorRegExp = new RegExp(
        /^[a-zA-Z\s]{1,50}$/
      );

      const titleRegExp = new RegExp(
        /^[a-zA-Z\s]{1,25}$/
      );

      const emailRegExp = new RegExp(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      );

      if(!authorRegExp.test(author)){
        throw new Error('Invalid author');
      };
      if(!titleRegExp.test(title)){
        throw new Error('Invalid title');
      };
      if(!emailRegExp.test(email)){
        throw new Error('Invalid email');
      };

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0];
      if((fileExt === 'jpg' || fileExt === 'png' || fileExt === 'gif') && author.length <= 50 && title.length <= 25){
        const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
        throw new Error('This file is unsupported');
      }
    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const userIP = requestIp.getClientIp(req);
    const findUser = await Voter.findOne({ user: userIP})
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });

    if(findUser){
      if(findUser.votes.includes(photoToUpdate._id)){
        res.status(500).json(err);
      } else {
        photoToUpdate.votes += 1;
        await photoToUpdate.save();
        findUser.votes.push(photoToUpdate._id);
        await findUser.save();
        res.json(photoToUpdate);
      } 
    } else {
        const newVoter = new Voter({ user: userIP, votes: [photoToUpdate._id] });
        await newVoter.save();
        photoToUpdate += 1;
        await photoToUpdate.save();
        res.json(photoToUpdate);
      }
  } catch(err) {
    res.status(500).json(err);
  }

};

