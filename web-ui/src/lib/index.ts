import http from "http"
//custom fetcher
import fetchWebsite from "./utils/fetchWebsite"
import handleError, { NotFoundError } from "./utils/handleError"
require("dotenv").config()

const host = "localhost"
const PORT = process.env.PORT

const requestListener = async (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  const time1 = performance.now()
  //pattern from nodejs docs for getting the body from the request
  //without using other third parties: https://nodejs.dev/learn/get-http-request-body-data-using-nodejs
  const buffers = []
  for await (const chunk of req) {
    buffers.push(chunk)
  }
  const body = Buffer.concat(buffers).toString()
  const parsedBody = JSON.parse(body)
  //expected: { url: "https://www.google.com" }
  try {
    const response = await fetchWebsite(parsedBody.url)
    const time2 = performance.now()
    console.log(`Time taken: ${time2 - time1}ms`)
    const { title, description, image } = response
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(
      JSON.stringify({
        title,
        description,
        image,
      })
    )
  } catch (error: any) {
    //if the error is an instance of the NotFoundError class, then send back the message as the response
    if (error instanceof NotFoundError) {
      res.writeHead(404, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "URLNOTFOUND" }))
    } else if (error.message == "Invalid URL") {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "INVALIDURL" }))
    } else {
      handleError(res, "Error getting data", error)
    }
  }
}

const server = http.createServer(requestListener)
server.listen(PORT, () => {
  console.log(`Server running on http://${host}:${PORT}`)
})
