import authRouter from './auth/auth.router.js'
import userRouter from './user/user.router.js'
import productRouter from './product/product.router.js'
import orderRouter from './order/order.router.js'
import cartRouter from './cart/cart.router.js'
import { globalErrorHandling } from '../services/errorHandling.js'
import connectDB from '../../DB/connection.js'
import morgan from 'morgan'
import cors from 'cors'

//convert Buffer Data

export const appRouter = (app , express) => {
    //convert Buffer Data

    // var whitelist = ['https://linkitqa.netlify.app']
    // var corsOptions = {
    //     origin: function (origin, callback) {
    //         if (whitelist.indexOf(origin) !== -1) {
    //             callback(null, true)
    //         } else {
    //             console.log("Faiiiiiiiiiiil");
    //             callback(new Error('Not allowed by CORS'))
    //         }
    //     }
    // }

    // const corsOptions ={
    //     origin:'http://localhost:4200', 
    //     credentials:true,            //access-control-allow-credentials:true
    //     optionSuccessStatus:200
    // }
    // app.use(cors(corsOptions));
    
    app.use(async (req, res, next) => {
        await res.header('Access-Control-Allow-Origin', '*');
        await res.header('Access-Control-Allow-Headers', '*')
        await res.header("Access-Control-Allow-Private-Network", 'true')
        await res.header('Access-Control-Allow-Methods','*')
        console.log("Origin Work");
        next();
    });
    app.use(express.json({}))
    app.use(express.urlencoded({ extended: false }))
    app.use(async (req, res, next) => {
        await res.header('Access-Control-Allow-Origin', '*');
        await res.header('Access-Control-Allow-Headers', '*')
        await res.header("Access-Control-Allow-Private-Network", 'true')
        await res.header('Access-Control-Allow-Methods','*')
        console.log("Origin Work");
        next();
    });
    // setup port and the baseUrl
    if (process.env.MOOD === 'DEV') {
        app.use(morgan("dev"))
    } else {
        app.use(morgan("combined"))
    }
    //Setup API Routing 
    app.get("/", (req, res, next) => {
        res.status(200).send("<h1>Welcome to Link-It for developer home Page</h1>")
    })
    app.use(`/auth`, authRouter)
    app.use(`/user`, userRouter)
    app.use(`/product`, productRouter)
    app.use(`/order`, orderRouter)
    app.use(`/cart`, cartRouter)


    app.use('*', (req, res, next) => {
        res.status(404).send("<h1>In-valid Routing Plz check url  or  method</h1>")
    })

    app.use(globalErrorHandling)

    connectDB()
}