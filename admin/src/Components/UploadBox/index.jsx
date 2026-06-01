import React, { useContext, useState } from 'react';
import { FaRegImages } from "react-icons/fa6";
import { uploadImages } from '../../utils/api.js';
import { MyContext } from '../../App';
import CircularProgress from '@mui/material/CircularProgress';

const MAX_DIM = 1920;
const QUALITY = 0.82;

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const { width, height } = img;
            let newWidth = width;
            let newHeight = height;

            if (width > MAX_DIM || height > MAX_DIM) {
                const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
                newWidth = Math.round(width * ratio);
                newHeight = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Canvas toBlob failed'));
                const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });
                resolve(compressed);
            }, 'image/jpeg', QUALITY);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

const UploadBox = (props) => {
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    const context = useContext(MyContext);

    const onChangeFile = async (e, apiEndPoint) => {
        try {
            setPreviews([]);
            const rawFiles = e.target.files;
            
            if (!rawFiles || rawFiles.length === 0) {
                return;
            }

            setUploading(true);

            const formdata = new FormData();
            const fieldName = props?.name || 'images';

            for (let i = 0; i < rawFiles.length; i++) {
                const file = rawFiles[i];
                const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
                if (!file || !validTypes.includes(file.type)) {
                    context.alertBox("error", "Please select a valid JPG, PNG or WebP image file.");
                    setUploading(false);
                    return;
                }
                const compressed = file.type === 'image/svg+xml' ? file : await compressImage(file);
                formdata.append(fieldName, compressed);
            }

            const res = await uploadImages(apiEndPoint, formdata);
            setUploading(false);
            
            if (res?.data?.images && Array.isArray(res.data.images)) {
                props.setPreviewsFun(res.data.images);
            } else if (res?.images && Array.isArray(res.images)) {
                props.setPreviewsFun(res.images);
            } else {
                context.alertBox("error", "Upload failed. Please try again.");
            }

        } catch (error) {
            console.error("Upload error:", error);
            setUploading(false);
            const errorMsg = error.response?.data?.message || error.message || 'Please try again';
            context.alertBox("error", `Upload failed: ${errorMsg}`);
        }
    }


    return (
        <div className='uploadBox p-3 rounded-md overflow-hidden border border-dashed border-[rgba(0,0,0,0.3)] h-[150px] w-[100%] bg-gray-100 cursor-pointer hover:bg-gray-200 flex items-center justify-center flex-col relative'>

            {
                uploading === true ? <>
                <CircularProgress />
                <h4 className="text-center">Uploading...</h4>
                </> :
                    <>
                        <FaRegImages className='text-[40px] opacity-35 pointer-events-none' />
                        <h4 className='text-[14px] pointer-events-none'>Image Upload</h4>

                        <input type="file" accept='image/*' multiple={props.multiple !== undefined ? props.multiple : false} className='absolute top-0 left-0 w-full h-full z-50 opacity-0'
                            onChange={(e) =>
                                onChangeFile(e, props?.url)
                            }
                            name={props?.name}
                        />

                    </>
            }


        </div>
    )
}


export default UploadBox;