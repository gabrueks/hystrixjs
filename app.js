const express = require(`express`);
const app = express();
const axios = require(`axios`);
const CommandsFactory = require('hystrixjs').commandFactory;
const onRun = async () => await axios.post(`http://localhost:3100`);
const fallback = async () => await axios.post(`http://localhost:3200`);

var hystrixSSEStream = require('hystrixjs').hystrixSSEStream;
function hystrixStreamResponse(request, response) {
    response.append('Content-Type', 'text/event-stream;charset=UTF-8');
    response.append('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    response.append('Pragma', 'no-cache');
    return hystrixSSEStream.toObservable().subscribe(
        function onNext(sseData) {
            this.resp = sseData;
            response.write('data: ' + sseData + '\n\n');
        },
        function onError(error) {console.log(error);
        },
        function onComplete() {
            return response.end();
        }
    );
};

app.get('/sse', hystrixStreamResponse);


app.get('/', async (req, res) => {

  const serviceCommand = CommandsFactory.getOrCreate("Service on port :" + 3000 + ":" + 3000)
      .circuitBreakerErrorThresholdPercentage(50)
      .timeout(900)
      .run(onRun)
      .circuitBreakerRequestVolumeThreshold(2)
      .circuitBreakerSleepWindowInMilliseconds(10000)
      .statisticalWindowLength(10000)
      .statisticalWindowNumberOfBuckets(10)
      .fallbackTo(fallback)
      .build()
    
    try {
        const promise =  await serviceCommand.execute();
        res.status(200).json(promise.data);
    } catch (e) {
        console.log(e);
        res.status(500).json({erro: 'os servidores parecem não estar rodando.'})
    }
    
})

app.listen(3000)
