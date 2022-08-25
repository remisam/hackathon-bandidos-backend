const express = require("express")
const morgan = require("morgan")
const cors = require("cors")

const bandits = require("./routes/bandits")

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan("dev"))
app.use("/bandits", bandits)

app.get("/", (req, res) => {
	res.send("je suis un bandit")
})

app.listen(4242, () => console.log("Express Server http://localhost:4242"))