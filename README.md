# jubatus example of code


## language classification

clone the code
```
git clone https://github.com/bahout/jubatus-node-example.git
```

run npm init
```
npm init
```

edit config.js
```
module.exports = {
    jubatus_ip: 'jubatus_ip',
    jubatus_port: 'jubatus_port',
    trainingFile: './language-training.txt',
    testFile: './language-test.txt',
    name: 'sample'
    /* optionnal
     concurrency: 5,
     bufferTimeOut: 400,
     isDebugEnabled: false
     */
};
```