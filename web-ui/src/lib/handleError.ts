import http from "http"

export class NotFoundError extends Error {
  readonly msg: string

  constructor(msg: string) {
    super("NotFoundError: " + msg)
    this.msg = msg
  }
}

function handleError(res: http.ServerResponse, msg: string, e: any) {
  if (e instanceof NotFoundError) {
    res.writeHead(404)
    console.log(msg)
    console.log(e.message)
    res.end(msg)
  } else {
    res.writeHead(400)
    console.log(msg)
    console.log(e)
    res.end(msg)
  }
}

export default handleError
