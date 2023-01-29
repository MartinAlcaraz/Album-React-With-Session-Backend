import { Schema, model } from "mongoose";

const categorySchema = new Schema({
    userId: Object,
    categories: [{
        categoryName: {
            type: String,
            trim: true,
            required: true
        },
        imageUrl: {
            type: String
        },
        category_img_public_id: String
    }]
}
);

const Category = model('Category', categorySchema);

export default Category;