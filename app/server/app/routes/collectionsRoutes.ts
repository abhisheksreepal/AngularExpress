

import  * as express from 'express';
import { MongoClient,Db, Collection} from 'mongodb';
import  * as config  from '../config';
import {getFeatureDuration,getFeatureStatus,isScenarioFailed,getStepFailCount,getStepPassCount,getStepPendingCount,getStepSkipCount,getStepUndefinedCount} from '../utilities/extractFeatureInfo';

const router = express.Router()

const rootPath = "/";
const collectionsPath = "/collections";
const listOfRuns = "/collections/:collectionId/runs";
const listOfRunsDocs = "/collections/:collectionId";
const runInfo = "/collections/:collectionId/runs/:runId";
const featureInfoForaRun = "/collections/:collectionId/runs/:runId/features";

router.get(rootPath,function(req,res){
  res.redirect(collectionsPath);
})

router.get(collectionsPath, function (req, res) {
    let components: String[] =[];


  let mongoClient = new MongoClient();

   mongoClient.connect(
    config.mongoDBConnectionString
  ).then(( db ) =>{
      console.log(`Connected to DB successfully`);
      let out: String[] =[];
      db.collections().then((collections) => {
                    collections.forEach((collection) => {
                    console.log(`Collection Name - ${collection.collectionName}`);
                    out.push(collection.collectionName);
                  });
                  db.close();
                  res.send(out) 
            })    

  }).catch((reason) => {
    res.status(500).send(reason);
  }) 
});


router.get(listOfRuns, function (req, res) {
    let components: String[] =[];


  let mongoClient = new MongoClient();

   mongoClient.connect(
    config.mongoDBConnectionString
  ).then(( db ) =>{
      console.log(`Connected to DB successfully`);
      db.collection(req.params.collectionId).distinct("runId",{},(err,data) => {
            console.log("Data - "+data);
            if(err){
                    res.send(500,`Something wrong ${err}`)
                }
            db.close();
            res.json(data);
        })    

  }).catch((reason) => {
    res.status(500).send(reason);
  }) 
});


router.get(listOfRunsDocs, function (req, res) {
    let components: String[] =[];


  let mongoClient = new MongoClient();

   mongoClient.connect(
    config.mongoDBConnectionString
  ).then(( db ) =>{
      console.log(`Connected to DB successfully`);
      db.collection(req.params.collectionId).find(req.query).toArray((err,data) => {
                data.forEach((row) => {
                    console.log(`URI - `+row.uri);
                });
                if(err){
                    res.send(500,`Something wrong ${err}`)
                }
                db.close();
                res.json(data);         
    })  

  }).catch((reason) => {
    res.status(500).send(reason);
  }) 
});

router.get(runInfo, function (req, res) {
    let components: String[] =[];


  let mongoClient = new MongoClient();

   mongoClient.connect(
    config.mongoDBConnectionString
  ).then(( db ) =>{
      console.log(`Connected to DB successfully`);
      
      db.collection(req.params.collectionId).find({"runId": Number(req.params.runId)}).toArray((err,data) => {
                let runIdInfo = {};
                let status = "passed";
                let percentage = 0;
                let totalCount = 0;
                let passCount=0;
                console.log(data);
                data.forEach((row) => {
                  ++totalCount;
                  runIdInfo['environment']=row.environment;
                  runIdInfo['browser'] = row.browser;
                  runIdInfo['time']= new Date(Number(req.params.runId));
                  runIdInfo['category'] = row.category;
                  console.log("Row status - "+row.status)
                  if(row.status !== "passed"){
                      status = "failed";
                  }else{
                    ++passCount;
                  }
                    console.log(`URI - `+runIdInfo);
                });
                percentage = passCount/totalCount * 100;
                runIdInfo['percentage'] = percentage.toString();
                runIdInfo['status'] = status;
                runIdInfo['data'] = data;
                if(err){
                    res.send(500,`Something wrong ${err}`)
                }
                db.close();
                res.json(runIdInfo);         
    })  

  }).catch((reason) => {
    res.status(500).send(reason);
  }) 
});


router.get(featureInfoForaRun, function (req, res) {
    let components: String[] =[];


  let mongoClient = new MongoClient();

   mongoClient.connect(
    config.mongoDBConnectionString
  ).then(( db ) =>{
      console.log(`Connected to DB successfully`);
      
      db.collection(req.params.collectionId).find({"runId": Number(req.params.runId)}).toArray((err,data) => {
               
                let features =  {};
                data.forEach( (row) => {
                   if( !(row.name in features)){
                    features[row.name] = row;
                   }else{
                       for (let element of row.elements) {
                            features[row.name]['elements'].push(element);
                     }
                   }
                })
               
                console.log(features);
                let out: any[] = [];
                for (let key in features){
                     let info = {};
                      let steps = 0;

                      for (let i=0;i<features[key].elements.length;i++){
                          steps += features[key].elements[i].steps.length;
                      }

                      let featureDuration = 0;
                      for (let i=0;i<features[key].elements.length;i++){
                          
                          featureDuration+=getFeatureDuration(features[key].elements[i].after)
                          featureDuration+=getFeatureDuration(features[key].elements[i].before)
                          featureDuration+=getFeatureDuration(features[key].elements[i].steps)

                      }
                      featureDuration = featureDuration / 1000000000 / 60; 


                      let featureStatus = ""
                      for (let i=0;i<features[key].elements.length;i++){
                          featureStatus = getFeatureStatus(features[key].elements[i].after);
                          if (featureStatus === "failed"){
                              break;
                          }
                          featureStatus = getFeatureStatus(features[key].elements[i].before);
                          if (featureStatus === "failed"){
                              break;
                          }
                          featureStatus = getFeatureStatus(features[key].elements[i].steps);
                          if (featureStatus === "failed"){
                              break;
                          }
                      }

                      let scenarioFailCount = 0;
                      for (let i=0;i<features[key].elements.length;i++){
                          
                          if(isScenarioFailed(features[key].elements[i].after) || isScenarioFailed(features[key].elements[i].before) || isScenarioFailed(features[key].elements[i].steps)){
                             scenarioFailCount++;
                          }   

                      }
                      let scenarioPassCount = features[key].elements.length - scenarioFailCount;

                      let stepPassCount = 0;
                      let stepFailCount = 0;
                      let stepSkipCount = 0;
                      let stepUndefinedCount = 0;
                      let stepPendingCount = 0;
                      for (let i=0;i<features[key].elements.length;i++){
                          
                          stepFailCount += getStepFailCount(features[key].elements[i].steps);
                          stepPassCount += getStepPassCount(features[key].elements[i].steps);
                          stepSkipCount += getStepSkipCount(features[key].elements[i].steps);
                          stepUndefinedCount += getStepPendingCount(features[key].elements[i].steps);
                          stepPendingCount += getStepUndefinedCount(features[key].elements[i].steps);

                      }

                      info['name']= features[key].name;
                      info['totalSteps'] = steps;
                      info['featureDuration'] = featureDuration;
                      info['featureStatus']=featureStatus;
                      info['totalScenarios']=features[key].elements.length;
                      info['scenarioFailCount']=scenarioFailCount
                      info['scenarioPassCount']=scenarioPassCount;
                      info['stepPassCount']= stepPassCount;
                      info['stepFailCount']= stepFailCount;
                      info['stepPendingCount']=stepPendingCount;
                      info['stepSkipCount']= stepSkipCount;
                      info['stepUndefinedCount']= stepUndefinedCount;
                      out.push(info);
                }
               
                db.close();
                res.json(out);         
    })  

  }).catch((reason) => {
    res.status(500).send(reason);
  }) 
});




export { router };