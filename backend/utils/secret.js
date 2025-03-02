const fs = require('fs')

module.exports = function readSecretFile(name) {
    return new Promise((resolve, reject) => {
        fs.readFile(`/run/secrets/${name}`, "utf-8", (err, data) => {
            if (err) reject(err)
            resolve(data)
        })
    })
}