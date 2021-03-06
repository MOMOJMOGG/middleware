// app.js
const express = require('express')
const moment = require('moment')
const fs = require('fs')
const chalk = require('chalk')
const app = express()
const port = 3000

const getActualRequestDurationInMilliseconds = start => {
  const NS_PER_SEC = 1e9 // convert to nanoseconds
  const NS_TO_MS = 1e6  // convert to milliseconds
  const diff = process.hrtime(start) // The process.hrtime() method returns the current high-resolution real-time in a [seconds, nanoseconds] tuple Array
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}

let startLogger = (req, res, next) => {
  let date = new Date()
  date = moment(date).format('YYYY-MM-DD hh:mm:ss')
  const start = process.hrtime()
  const method = req.method
  const url = req.url
  const status = res.statusCode
  // set res locals varialble
  res.locals.startTime = start
  res.locals.method = method
  res.locals.url = url
  res.locals.status = status
  res.locals.startDate = date

  const log = `${chalk.redBright("[Logs]")} Request Start: ${chalk.blue(date)} | ${method} from ${url} | status: ${chalk.green(status)}`
  console.log(log)

  next()
}

let writeStartLogger = (req, res, next) => {
  const date = res.locals.startDate
  const method = res.locals.method
  const url = res.locals.url
  const status = res.locals.status

  const logContent = `[Logs] Request Start: ${date} | ${method} from ${url} | status: ${status}`
  fs.appendFile("./Logs/request.txt", logContent + "\n", err => {
    if (err) console.log(err)
  })

  next()
}

let endLogger = (req, res, next) => {
  let date = new Date()
  date = moment(date).format('YYYY-MM-DD hh:mm:ss')
  const durationInMilliseconds = getActualRequestDurationInMilliseconds(res.locals.startTime).toLocaleString()
  const method = res.locals.method
  const url = res.locals.url
  const status = res.statusCode
  res.locals.status = status
  res.locals.endDate = date
  res.locals.totalTime = durationInMilliseconds

  let log = `${chalk.redBright("[Logs]")} Request End: ${chalk.blue(date)} | ${method} from ${url} | status: ${chalk.green(status)}`
  console.log(log)


  log = `${chalk.redBright("[Logs]")} Request: ${chalk.blue(date)} | ${method} from ${url} | status: ${chalk.green(status)} | total time: ${chalk.red(durationInMilliseconds)} ms`
  console.log(log)


  next()
}

let writeEndLogger = (req, res) => {
  const date = res.locals.endDate
  const method = res.locals.method
  const url = res.locals.url
  const status = res.locals.status
  const durationInMilliseconds = res.locals.totalTime

  let logContent = `[Logs] Request End: ${date} | ${method} from ${url} | status: ${status}`
  fs.appendFile("./Logs/request.txt", logContent + "\n", err => {
    if (err) console.log(err)
  })

  logContent = `[Logs] Request: ${date} | ${method} from ${url} | status: ${status} | total time: ${durationInMilliseconds} ms`
  fs.appendFile("./Logs/request.txt", logContent + "\n", err => {
    if (err) console.log(err)
  })
}

app.use(startLogger)
app.use(writeStartLogger)

app.get('/', (req, res, next) => {
  res.send('???????????? Todo')
  next()
})

app.get('/new', (req, res, next) => {
  res.send('?????? Todo ??????')
  next()
}, endLogger, writeEndLogger) // ?????? /new ????????? => Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client?????????middleware????????????????????????

app.get('/:id', (req, res, next) => {
  res.send('???????????? Todo')
  next()
})

app.post('/', (req, res, next) => {
  res.send('????????????  Todo')
  next()
})

app.use(endLogger)
app.use(writeEndLogger)

app.listen(port, () => {
  console.log(`App running on port ${port}`)
})