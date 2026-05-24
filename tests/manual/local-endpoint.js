import http from "node:http";

const server = http.createServer((request, response) => {
  if (request.method !== "POST" || request.url !== "/capture") {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const chunks = [];

  request.on("data", (chunk) => {
    chunks.push(chunk);
  });

  request.on("end", () => {
    const rawBody = Buffer.concat(chunks).toString("utf8");
    let payload;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      response.writeHead(400, { "Content-Type": "application/json; charset=UTF-8" });
      response.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      return;
    }

    const html = typeof payload.html === "string" ? payload.html : "";
    const isValidPayload = typeof payload.type === "string" && payload.type.trim().length > 0 && html.length > 0;

    console.log(`Received payload type=${payload.type || "missing"} htmlBytes=${Buffer.byteLength(html, "utf8")}`);

    response.writeHead(isValidPayload ? 200 : 422, {
      "Content-Type": "application/json; charset=UTF-8"
    });
    response.end(JSON.stringify({
      ok: isValidPayload,
      type: payload.type,
      htmlBytes: Buffer.byteLength(html, "utf8"),
      receivedAt: new Date().toISOString()
    }));
  });
});

server.listen(3000, "127.0.0.1", () => {
  console.log("Local endpoint listening at http://localhost:3000/capture");
});
