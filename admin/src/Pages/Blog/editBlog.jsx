import React, { useContext, useEffect } from 'react'
import UploadBox from '../../Components/UploadBox';
import { IoMdClose } from "react-icons/io";
import { Button } from '@mui/material';
import { FaCloudUploadAlt } from "react-icons/fa";
import { useState } from 'react';
import { deleteImages, editData, fetchDataFromApi, postData } from '../../utils/api';
import { MyContext } from '../../App';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import Editor from 'react-simple-wysiwyg';

const EditBlog = () => {

    const [formFields, setFormFields] = useState({
        title: "",
        images: [],
        description: ""
    })

    const [previews, setPreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [html, setHtml] = useState('');

    const history = useNavigate();

    const context = useContext(MyContext);

      useEffect(()=>{
            const id = context?.isOpenFullScreenPanel?.id;
            if (id) {
                fetchDataFromApi(`/api/blog/${id}`).then((res)=>{
                    if (res?.blog) {
                        setFormFields({
                            title: res.blog.title || "",
                            images: res.blog.images || [],
                            description: res.blog.description || ""
                        })
                        setPreviews(res.blog.images || [])
                        setHtml(res.blog.description || "");
                    }
                })
            }
        },[context?.isOpenFullScreenPanel?.id]);

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields(() => {
            return {
                ...formFields,
                [name]: value
            }
        })
    }

    const setPreviewsFun = (previewsArr) => {
        const imgArr = previews;
        for (let i = 0; i < previewsArr.length; i++) {
            imgArr.push(previewsArr[i])
        }

        setPreviews([])
        setTimeout(() => {
            setPreviews(imgArr)
            formFields.images = imgArr
        }, 10);
    }

    const removeImg = (image, index) => {
        var imageArr = [];
        imageArr = previews;
        deleteImages(`/api/category/deteleImage?img=${image}`).then((res) => {
            imageArr.splice(index, 1);

            setPreviews([]);
            setTimeout(() => {
                setPreviews(imageArr);
                formFields.images = imageArr
            }, 100);

        })
    }


    const onChangeDescription=(e)=>{
        const value = e.target.value;
        setHtml(value);
        setFormFields(prev => ({
            ...prev,
            description: value
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);

        if (!formFields.title?.trim()) {
            context.alertBox("error", "Please enter title");
            setIsLoading(false);
            return
        }

        if (!formFields.description?.trim()) {
            context.alertBox("error", "Please enter description");
            setIsLoading(false);
            return
        }

        if (previews?.length === 0) {
            context.alertBox("error", "Please select blog image");
            setIsLoading(false);
            return
        }

        try {
            const res = await editData(`/api/blog/${context?.isOpenFullScreenPanel?.id}`, formFields);
            
            if (res?.success) {
                context.alertBox("success", "Blog updated successfully!");
            } else {
                context.alertBox("error", res?.message || "Failed to update blog");
            }
            
            setTimeout(() => {
                setIsLoading(false);
                context.setIsOpenFullScreenPanel({
                    open: false,
                })
                history("/blog/List")
            }, 1000);
        } catch (error) {
            context.alertBox("error", "Failed to update blog");
            setIsLoading(false);
        }
    }

    return (
        <section className='p-5 bg-gray-50'>
            <form className='form py-1 p-1 md:p-8 md:py-1' onSubmit={handleSubmit}>
                <div className='scroll max-h-[72vh] overflow-y-scroll pr-4 pt-4'>
                    <div className='grid grid-cols-1 mb-3'>
                        <div className='col w-[100%]'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'> Title</h3>
                            <input type="text" className='w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm' name="title" value={formFields.title} onChange={onChangeInput}
                            />
                        </div>
                    </div>


                    <div className='grid grid-cols-1 mb-3'>
                        <div className='col w-[100%]'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'> Description</h3>
                            <Editor value={html} onChange={onChangeDescription}  containerProps={{ style: { resize: 'vertical' } }}/>
                          
                        </div>
                    </div>

                    <br />

                    <h3 className='text-[18px] font-[500] mb-1 text-black'>Image</h3>
                    <br />
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                        {
                            previews?.length !== 0 && previews?.map((image, index) => {
                                return (
                                    <div className="uploadBoxWrapper relative" key={index}>

                                        <span className='absolute w-[20px] h-[20px] rounded-full  overflow-hidden bg-red-700 -top-[5px] -right-[5px] flex items-center justify-center z-50 cursor-pointer' onClick={() => removeImg(image, index)}><IoMdClose className='text-white text-[17px]' /></span>


                                        <div className='uploadBox p-0 rounded-md overflow-hidden border border-dashed border-[rgba(0,0,0,0.3)] h-[150px] w-[100%] bg-gray-100 cursor-pointer hover:bg-gray-200 flex items-center justify-center flex-col relative'>

                                            <img src={image} className='w-100' />
                                        </div>
                                    </div>
                                )
                            })
                        }


                        <UploadBox multiple={true} name="images" url="/api/blog/uploadImages" setPreviewsFun={setPreviewsFun} />
                    </div>
                </div>

                <br />

                <br />
                <div className='w-[250px]'>
                    <Button type="submit" className="btn-blue btn-lg w-full flex gap-2">
                        {
                            isLoading === true ? <CircularProgress color="inherit" />
                                :
                                <>
                                    <FaCloudUploadAlt className='text-[25px] text-white' />
                                    Publish and View
                                </>
                        }
                    </Button>
                </div>


            </form>
        </section>
    )
}

export default EditBlog;
