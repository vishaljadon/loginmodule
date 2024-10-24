import createRiskModel from "../models/createRiskModel.js";

async function saveRisk(uId,content) {

    try {
        var risk = await createRiskModel.create({
            ...content,
            created_by: uId,
            updated_by: uId,
        });
    } catch (error) {
        console.log(error)
        return {
            status: false,
            msg: "Error in saving risk"
        };
    }

    return {

        status: true,
        msg: risk.id,
    }
}

async function updateRisk(id,uId,content) {
    try {
        var risk = await createRiskModel.findById(id)
    } finally {
        if (risk == null ) {
            return {
                status: false,
                msg: `No risk foudn with id ${id}`
            }
        }
    }

    risk.content = content;
    risk.updated_by = uId;
    risk.updated_at = Date.now();
    await risk.save();

    return {
        status: true,
        msg: `Risk updated successfully`
    }
}

async function deleteRisk(id,uId) {
    try {
        await createRiskModel.findByIdAndDelete(id)
    } catch (error) {
        return {
            status: false,
            msg: `No risk found with id ${id}`
        }
    }

    return {
        status: true,
        msg: `Risk deleted successfully`
    }
}

async function getAllRisks() {
    try {
        const risks = await createRiskModel.find();
        return {
            status: true,
            risks: risks
        };
    } catch (error) {
        console.log(error);
        return {
            status: false,
            msg: "Error in retrieving risks"
        };
    }
}

// export const getAllPosts = async (req, res, next) => {
//     try {
//         const posts = await createRiskSchema.find();

//         res.status(200).json({
//             status: 'Success',
//             results: posts.length,
//             data: {
//                 posts
//             }
//         });
//     } catch (e) {
//         console.log(e)
//         res.status(400).json({
//             status: 'Fail',
//         });
//     }
// };

// export const getOnePost = async (req, res, next) => {
//     try {
//         const postId = req.params.id

//         if (!mongoose.isValidObjectId(postId)) {
//             return res.status(400).json({
//                 status: 'Fail',
//                 message: 'Invalid post ID',
//             });
//         }

//         const post = await createRiskSchema.findById(postId);

//         res.status(200).json({
//             status: 'Success',
//             data: {
//                 post,
//                 calculated_risk: post.calculated_risk
//             }
//         });
//     } catch (e) {
//         console.log(e)
//         res.status(400).json({
//             status: 'Fail',
//         });
//     }
// };

export {
    saveRisk,
    updateRisk,
    deleteRisk,
    getAllRisks
}


// export const createPost = async (req, res, next) => {
//     try {
//         const post = await createRiskSchema.create(req.body);

//         res.status(200).json({
//             status: 'Success',
//             data: {
//                 post,
//             }
//         });
//     } catch (e) {
//         console.log(e)
//         res.status(400).json({
//             status: 'Fail',
//         });
//     }
// };

// export const updatePost = async (req, res, next) => {
//     try {
//         const postId = req.params.id

//         if (!mongoose.isValidObjectId(postId)) {
//             return res.status(400).json({
//                 status: 'Fail',
//                 message: 'Invalid post ID',
//             });
//         }

//         const post = await createRiskSchema.findByIdAndUpdate(postId, req.body, {
//             new: true,
//             runValidators: true,
//         });

//         res.status(200).json({
//             status: 'Success',
//             data: {
//                 post,
//             }
//         });
//     } catch (e) {
//         console.log(e)
//         res.status(400).json({
//             status: 'Fail',
//         });
//     }
// };

// export const deletePost = async (req, res, next) => {
//     try {
//        const postId = req.params.id

//         if (!mongoose.isValidObjectId(postId)) {
//             return res.status(400).json({
//                 status: 'Fail',
//                 message: 'Invalid post ID',
//             });
//         }

//         const posts = await createRiskSchema.findByIdAndDelete(postId);

//         res.status(200).json({
//             status: 'Success',
//         });
//     } catch (e) {
//         console.log(e)
//         res.status(400).json({
//             status: 'Fail',
//         });
//     }
// };
