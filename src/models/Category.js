import { Schema, model } from "mongoose";

const categorySchema = new Schema({
    userId: Object,
    categories: [{
        categoryName: { type: String, trim: true, required: true },
        category_id: { type: String, required: true },
        imageUrl: String,
        category_img_public_id: String,
        isActive: {
            type: Boolean,
            default: false
        }
    }]
});

const Category = model('Category', categorySchema);

export default Category;