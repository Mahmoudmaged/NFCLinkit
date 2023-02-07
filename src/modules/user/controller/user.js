import { findById, findOne, findOneAndUpdate, updateOne, find } from "../../../../DB/DBMethods.js"
import userModel from "../../../../DB/model/User.model.js"
import cloudinary from "../../../services/cloudinary.js"
import { asyncHandler } from "../../../services/errorHandling.js"
import bcrypt from 'bcryptjs'
export const userProfile = asyncHandler(async (req, res, next) => {
    const user = await findById({
        model: userModel,
        filter: req.user._id,
        populate: [{
            path: 'contacts',
            select: "userName email firstName lastName image"
        }]
    })
    return user ? res.status(200).json({ message: `Done`, user }) : next(new Error('In-valid user', { cause: 404 }))
})

// export const profile = asyncHandler(async (req, res, next) => {
//     const user = await userModel.find({}).populate([{
//         path: 'contacts',
//         select: "userName email"
//     }])
//     return user ? res.status(200).json({ message: `Done`, user }) : next(new Error('In-valid user', { cause: 404 }))
// })

export const userSharedProfile = asyncHandler(async (req, res, next) => {
    const user = await findById({
        model: userModel,
        filter: req.params.id,
        select: "-password"
    })
    if (!user) {
        return next(new Error('In-valid user', { cause: 404 }))
    } else {
        if (req.query.to == 'FE') {
            return res.status(200).redirect(`${process.env.FEURL}#/user/${user._id}/shared`)
        } else {
            return res.status(200).json({ message: `Done`, user })
        }
    }
})

export const basicInfo = asyncHandler(async (req, res, next) => {

    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `NFC_CARD/user/${req.user._id}` })
        req.body.image = secure_url;
        req.body.imagePublicId = public_id
    }
    const user = await findOneAndUpdate({
        model: userModel,
        filter: req.user._id,
        data: req.body,
        options: { new: false }
    })
    if (!user) {
        await cloudinary.uploader.destroy(req.body.imagePublicId)
        return next(new Error('Fail to update', { cause: 400 }))
    } else {
        if (user.imagePublicId) {
            await cloudinary.uploader.destroy(user.imagePublicId)
        }
        return res.status(200).json({ message: `Done`, user })
    }

})

export const socialLinks = asyncHandler(async (req, res, next) => {

    const user = await findOneAndUpdate({
        model: userModel,
        filter: req.user._id,
        data: { socialLinks: req.body.links },
        options: { new: true }
    })
    if (!user) {
        return next(new Error('Fail to update', { cause: 400 }))
    } else {
        return res.status(200).json({ message: `Done`, user })
    }

})


export const updatePassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body
    const user = await findOne({
        model: userModel,
        filter: { _id: req.user._id }
    })
    if (!user) {
        return next(new Error('Not register user', { cause: 400 }))
    }

    const match = bcrypt.compareSync(oldPassword, user.password)
    if (!match) {
        return next(new Error('Wrong old Password', { cause: 400 }))
    }

    const hashPassword = bcrypt.hashSync(newPassword, parseInt(process.env.SaltRound))
    await updateOne({
        model: userModel,
        filter: { _id: user._id },
        data: { password: hashPassword }
    })
    return res.status(200).json({ message: "Done" })
})

export const addToContacts = asyncHandler(async (req, res, next) => {
    const { id } = req.body
    if (req.user._id.toString() == id.toString()) {
        return next(new Error('Sorry you can not add yourself to your contacts list', { cause: 409 }))
    }
    const user = await findOne({
        model: userModel,
        filter: { _id: id },
    })
    if (!user) {
        return next(new Error('In-valid Account', { cause: 400 }))
    }


    await updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: { $addToSet: { contacts: user._id } }
    })
    return res.status(200).json({ message: "Done" })
})