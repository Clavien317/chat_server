const {ajout,liste, login, mono, verifier,verifyJwt, modif, supprimer, reinitial, initialisez} = require("../controller/UserController")
const router = require("express").Router()


router.post("/ajout",ajout)
router.get("/",liste)
router.post("/connect",login)
router.get("/:id",mono)
router.put("/:id",modif)
router.delete("/:id",supprimer)
router.post("/verifyAuth",verifyJwt,verifier)
router.post("/reinit",reinitial)
router.post("/initialisation",initialisez)

module.exports=router