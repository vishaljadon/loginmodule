import mongoose from "mongoose";
import { riskCommentModel } from "../models/riskCommentModel.js";
import createRiskModel from "../models/createRiskModel.js";
import exp from "constants";


async function saveComment(riskId, uId, content) {
    try {
        // if (!mongoose.isValidObjectId(riskId)) {
        //     return {
        //         status: false,
        //         msg: `No risk found with id ${riskId}`
        //     }
        // }
        if(await createRiskModel.exists({_id: riskId}) === false){
            return {
                status: false,
                msg: `No risk found with id ${riskId}`
            }
        }
        const comment = await riskCommentModel.create({
            riskId: riskId,
            content: content,
            created_by: uId,
            updated_by: uId,
        });
        return {
            status: true,
            msg: comment._id,
        };
    } catch (error) {
        return {
            status: false,
            msg: "Error in saving comment"
        };
    }
}

async function deleteComment(riskId, id, uId, content) {
    try {
        if(await createRiskModel.exists({_id: riskId}) === false){
            return {
                status: false,
                msg: `No risk found with id ${riskId}`
            }
        }
        var comment = await riskCommentModel.findOneAndDelete({
            _id: id,
            created_by: uId,
        });
    } catch (error) {
        return {
            status: false,
            msg: "Error in deleting comment"
        };
    }

    return {
        status: true,
        msg: comment.id,
    }
}

async function getCommentsByRiskId(riskId) {
    try {
        if(await createRiskModel.exists({_id: riskId}) === false){
            return {
                status: false,
                msg: `No risk found with id ${riskId}`
            }
        }

        var comments = await riskCommentModel.find({ riskId });
        return {
            status: true,
            comments: comments,
        };
    } catch (error) {
        return {
            status: false,
            msg: "Error in retrieving comments"
        };
    }
}

export {
    saveComment,
    deleteComment,
    getCommentsByRiskId
}

// export const getAllComments = async (req, res, next) => {
//     try {
//         const comments = await riskCommentModel.find();

//         res.status(200).json({
//             status: 'Success',
//             results: comments.length,
//             data: {
//                 comments
//             }
//         });
//     } catch (e) {
//         console.log(e)
//         res.status(400).json({
//             status: 'Fail',
//         });
//     }
// }

// export const getOneComment = async (req, res, next) => {
//     try {
//         const commentId = req.params.id

//         if (!mongoose.isValidObjectId(commentId)) {
//             return res.status(400).json({
//                 status: 'Fail',
//                 message: 'Invalid comment ID',
//             });
//         }

//         res.status(200).json({
//             status: 'Success',
//             data: {
//                 comment,
//             }
//         });
//     } catch (e) {
//         console.log(e)
//         res.status(400).json({
//             status: 'Fail',
//         });
//     }
// }

// export const createComment = async (req, res, next) => {
//     try {
//         const comment = await riskCommentModel.create(req.body);

//         res.status(200).json({
//             status: 'Success',
//             data: {
//                 comment,
//             }
//         });
//     } catch (e) {
//         console.log(e)
//         res.status(400).json({
//             status: 'Fail',
//         });
//     }
// }
