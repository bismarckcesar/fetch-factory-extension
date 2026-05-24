import http from "node:http";

const server = http.createServer((request, response) => {
  if (request.method !== "POST" || request.url !== "/capture") {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  let byteCount = 0;

  request.on("data", (chunk) => {
    byteCount += chunk.length;
  });

  request.on("end", () => {
    console.log(`Received HTML payload with ${byteCount} bytes.`);
    response.writeHead(204);
    response.end();
  });
});

server.listen(3000, "127.0.0.1", () => {
  console.log("Local endpoint listening at http://localhost:3000/capture");
});
