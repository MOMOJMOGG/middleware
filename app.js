// app.js
const express = require('express')
const moment = require('moment')
const fs = require('fs')
const chalk = require('chalk')
const app = express()
const port = 3000


let logger = (req, res, next) => {
  let date = new Date()
  date = moment(date).format('YYYY-MM-DD hh:mm:ss')
  const method = req.method
  const url = req.url
  const status = res.statusCode
  const log = `${chalk.redBright("[Logs]")} ${chalk.blue(date)} | ${method} from ${url} ${chalk.green(status)}`
  console.log(log)
  const logContent = `[Logs] ${date} | ${method} from ${url} ${status}`
  fs.appendFile("./Logs/request.txt", logContent + "\n", err => {
    if (err) console.log(err)
  })
  next()
}

app.use(logger)

app.get('/', (req, res) => {
  res.send('列出全部 Todo')
})

app.get('/new', (req, res) => {
  res.send('新增 Todo 頁面')
})

app.get('/:id', (req, res) => {
  res.send('顯示一筆 Todo')
})

app.post('/', (req, res) => {
  res.send('新增一筆  Todo')
})

app.listen(port, () => {
  console.log(`App running on port ${port}`)
})