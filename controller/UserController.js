const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const model = require("../Model/User")
const nodemailer = require("nodemailer")

const ajout =async(req, res)=>
 {
    const { nom, email, tel, password } = req.body
    if (!nom || !email || !tel || !password) {
        return res.status(400).json("La nom, le email, le tel et le password sont requis")
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        await model.create({ nom, email, tel, password: hashedPassword })
        res.send("Insertion réussie")
    } catch (error) {
        console.error(error)
        res.status(500).json("Erreur serveur lors de l'insertion")
        res.json("Erreur serveur lors de l'insertion")
    }
}

const liste=async(req, res)=>
{
    const data = await model.find()
    res.json(data)
}

const mono =async(req,res)=>
{
    const id = req.params.id
    const data = await model.find({ _id: id })
    res.json(data)
}

const login=async(req,res)=>
{
    const { email, password } = req.body;
    try {
        const utilisateur = await model.findOne({ email });
        const id = utilisateur._id;
        console.log(id);
        if (!utilisateur) {
            return res.status(401).json("Email invalide");
        }

        const passwordMatch = await bcrypt.compare(password, utilisateur.password);
        if (!passwordMatch) {
            return res.status(401).json("Email ou mot de passe invalide");
        }
        
        console.log(email, ": mot de passe ", password);
        const token = jwt.sign({ id: utilisateur._id }, "jwtSecretKey", { expiresIn: 300 });
        res.json({ result: "Connexion réussie", login: true, token, utilisateur,id });
        console.log(token);
    } catch (error) {
        res.status(500).json("Erreur lors de la connexion : " + error.message);
    }
}


const verifyJwt =(req,res,next)=>
{
    const token = req.headers["access-token"]
    if(!token)
    {
        return res.json("Nous avons besoin de token")
    }else
    {
        jwt.verify(token,"jwtSecretKey",(err,decoded)=>
        {
            if(err)
            {
                res.json("Non authentifiee")
            }else
            {
                req.userId = decoded.id
                console.log(req.userId);
                next()
            }
        })
    }
}
const verifier=(req,res)=>
{
    res.header('Access-Control-Allow-Origin', '*')
    return res.json("Authentified")
}

const modif=async(req,res)=>
{
    const id = req.params.id
    const data =
    {
        nom: req.body.nom,
        email: req.body.email,
        tel:req.body.tel,
        password:req.body.password
    }
    try {
        const d = await model.findByIdAndUpdate(id, data, { new: true })
        if (d) {
            res.json("Modifiée avec succès")
        } else {
            res.status(404).json("ID non trouvé")
        }
    } catch (error) {
        console.error(error)
        res.status(500).json("Erreur serveur")
    }
}



const supprimer=async(req,res)=>
{
    const id = req.params.id
    await model.findOneAndDelete({ _id: id })
    res.json("Supprimee avec succes")
}


const reinitial =async(req,res)=>
{
    const {email} = req.body
    const min = 10000
    const max = 99999
    const code =Math.round(Math.random()*(max-min)+min)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "claviennam317@gmail.com",
          pass: "amju lste ilxc kccx"
        }
      });

      const mailOptions = {
        from: "claviennam317@gmail.com",
        to: `${email}`,
        subject: 'RECUPERATION DE COMPTE',
        text: `Votre code de recuperation est ${code}`
      }
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        const user = await model.findOne({ email: email });
        if (!user) {
            return res.status(404).json("Utilisateur non trouvé");
        }
        user.recup = code;
        await user.save();
        res.status(200).json("OK");
    } catch (error) {
        console.error(error);
        res.status(500).json("Erreur lors de l'envoi de l'e-mail de récupération");
    }
}

const initialisez = async (req, res) => {
    const { password, email, code } = req.body;

    try {
        const user = await model.findOne({ email });

        if (!user) {
            return res.status(404).json("Utilisateur non trouvé");
        }

        if (user.recup ==`${code}`) {
            const hashedPassword = await bcrypt.hash(password, 10)
            user.password = hashedPassword;
            await user.save();
            return res.status(200).json("Mot de passe réinitialisé avec succès");
        } else {
            return res.status(400).json("Le code de récupération est incorrect");
        }
    } catch (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe :", error);
        return res.status(500).json("Erreur lors de la réinitialisation du mot de passe");
    }
}



module.exports = {ajout,liste,mono,login,verifier,modif,verifyJwt,supprimer,reinitial,initialisez}