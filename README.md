# Classify events
Classify events based on description field in csv field.

## Briefly about
This uses a (naive bayes algorithm)[https://en.wikipedia.org/wiki/Naive_Bayes_classifier] to classifier to determine whether events should be confirmed or deleted.

## Training files and field names
* `train/confirmed.csv` should contain event rows with descriptions matching those which should be confirmed
* `train/deleted.csv` should contain event rows with descriptions mathcing those which should be delete
* Training files should be in CSV format. 
* The first row of the csv file should contain header fields. 
* `config.js` should contain the names of the fields to be used for comparison (the field with the description in it):
```javascript
module.exports = 
{
    confirmedTrainField: 'field9',
    deletedTrainField: 'field18',
    inputDataField: 'description'
}
```

## installation
Make sure node js is installed

## Running the classifier
* `node classify.js /path/to/input.csv /output/dir/`
* two files will be generated:
* * `/output/dir/confirmed.csv`
* * `/output/dir/deleted.csv`


