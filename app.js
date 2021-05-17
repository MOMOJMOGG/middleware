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

  const log = `${chalk.redBright("[Logs]")} Request Start: ${chalk.blue(date)} | ${method} from ${url} | status: ${chalk.green(status)}`
  console.log(log)
  const logContent = `[Logs] Request Start: ${date} | ${method} from ${url} | status: ${status}`
  fs.appendFile("./Logs/request.txt", logContent + "\n", err => {
    if (err) console.log(err)
  })

  next()
}

let endLogger = (req, res) => {
  let date = new Date()
  date = moment(date).format('YYYY-MM-DD hh:mm:ss')
  const durationInMilliseconds = getActualRequestDurationInMilliseconds(res.locals.startTime).toLocaleString()
  const method = req.method
  const url = req.url
  const status = res.statusCode

  let log = `${chalk.redBright("[Logs]")} Request End: ${chalk.blue(date)} | ${method} from ${url} | status: ${chalk.green(status)}`
  console.log(log)
  let logContent = `[Logs] Request End: ${date} | ${method} from ${url} | status: ${status}`
  fs.appendFile("./Logs/request.txt", logContent + "\n", err => {
    if (err) console.log(err)
  })

  log = `${chalk.redBright("[Logs]")} Request: ${chalk.blue(date)} | ${method} from ${url} | status: ${chalk.green(status)} | total time: ${chalk.red(durationInMilliseconds)} ms`
  console.log(log)
  logContent = `[Logs] Request: ${date} | ${method} from ${url} | status: ${status} | total time: ${durationInMilliseconds} ms`
  fs.appendFile("./Logs/request.txt", logContent + "\n", err => {
    if (err) console.log(err)
  })
}

app.use(startLogger)

app.get('/', (req, res, next) => {
  res.send('列出全部 Todo')
  next()
})

app.get('/new', (req, res, next) => {
  res.send('新增 Todo 頁面')
  next()
}, endLogger) // 只有 /new 會出現 => Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client，因此middleware設定與其他不一樣

app.get('/:id', (req, res, next) => {
  res.send('顯示一筆 Todo')
  next()
})

app.post('/', (req, res, next) => {
  res.send('新增一筆  Todo')
  next()
})

app.use(endLogger)

app.listen(port, () => {
  console.log(`App running on port ${port}`)
})