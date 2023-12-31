import multiparty from 'multiparty';
import { mongooseConnect } from "@/lib/mongooseConnect";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import cloudinary from 'cloudinary';

export default async function handle(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  const form = new multiparty.Form();
  const { fields, files } = await new Promise((resolve, reject) => {
    form?.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const links = [];
  for (const file of files.file) {
    const result = await cloudinary.v2.uploader.upload(file.path);
    links.push(result.secure_url);
  }

  return res.json({ links });
}

export const config = {
  api: { bodyParser: false },
};
