import React, { useContext, useEffect, useState } from 'react';
import { Button } from "@mui/material";
import { IoMdAdd } from "react-icons/io";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { AiOutlineEdit } from "react-icons/ai";
import { GoTrash } from "react-icons/go";
import { MyContext } from '../../App';
import { deleteData, deleteMultipleData, fetchDataFromApi } from '../../utils/api';

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const columns = [
    { id: "image", label: "IMAGE", minWidth: 100 },
    { id: "title", label: "TITLE", minWidth: 200 },
    { id: "description", label: "DESCRIPTION", minWidth: 300 },
    { id: "action", label: "Action", minWidth: 100 },
];

export const BlogList = () => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [blogData, setBlogData] = useState([]);
    const [totalBlogs, setTotalBlogs] = useState(0);


    const [photos, setPhotos] = useState([]);
    const [open, setOpen] = useState(false);

    const context = useContext(MyContext);


    useEffect(() => {
        getData();
    }, [context?.isOpenFullScreenPanel, page, rowsPerPage])



    const getData = () => {
        context?.setProgress(50);
        fetchDataFromApi(`/api/blog?page=${page + 1}&perPage=${rowsPerPage}`).then((res) => {
            setBlogData(res?.blogs || []);
            setTotalBlogs(res?.totalPages ? res.totalPages * rowsPerPage : 0);
            let arr = [];
            context?.setProgress(100);
            if (res?.blogs?.length > 0) {
                for (let i = 0; i < res?.blogs?.length; i++) {
                    arr.push({
                        src: res?.blogs[i]?.images[0]
                    })
                }
            }
            setPhotos(arr);
        });
    }


    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };


    const deleteSlide = (id) => {
        if (context?.userData?.role === "ADMIN") {
            deleteData(`/api/blog/${id}`).then((res) => {
                context.alertBox("success", "Blog deleted");
                getData();
            })
        }else {
            context.alertBox("error", "Only admin can delete data");
        }
    }

    return (
        <>

            <div className="flex items-center justify-between px-2 py-0 mt-3">
                <h2 className="text-[18px] font-[600]">
                    Blog List
                    <span className="font-[400] text-[14px]"></span>
                </h2>

                <div className="col w-[25%] ml-auto flex items-center justify-end gap-3">

                    <Button className="btn-blue !text-white btn-sm" onClick={() => context.setIsOpenFullScreenPanel({
                        open: true,
                        model: 'Add Blog'
                    })}>Add Blog</Button>
                </div>


            </div>


            <div className="card my-4 pt-5 shadow-md sm:rounded-lg bg-white">

                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>

                                {columns.map((column) => (
                                    <TableCell
                                        width={column.minWidth}
                                        key={column.id}
                                        align={column.align}

                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                blogData?.length !== 0 && blogData?.slice()?.reverse()?.map((item, index) => {
                                    return (
                                        <TableRow key={index}>

                                            <TableCell>
                                                <div className="flex items-center">
                                                    <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-md overflow-hidden group cursor-pointer flex-shrink-0" onClick={() => setOpen(true)}>

                                                        <img
                                                            src={item?.images[0]}
                                                            alt={item?.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-all"
                                                        />
                                                    </div>

                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <span className='text-[15px] font-[500] block truncate max-w-[200px]'>{item?.title}</span>
                                            </TableCell>


                                            <TableCell>
                                                <div className="truncate max-w-[250px] md:max-w-[300px] text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: item?.description?.substr(0, 100) + '...' }} />
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button className="!w-[32px] !h-[32px] md:!w-[35px] md:!h-[35px] bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-[#f1f1f1] !min-w-[32px] md:!min-w-[35px]" onClick={() => context.setIsOpenFullScreenPanel({
                                                        open: true,
                                                        model: 'Edit Blog',
                                                        id: item?._id
                                                    })}>
                                                        <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[16px] md:text-[20px] " />
                                                    </Button>


                                                    <Button className="!w-[32px] !h-[32px] md:!w-[35px] md:!h-[35px] bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-[#f1f1f1] !min-w-[32px] md:!min-w-[35px]" onClick={() => deleteSlide(item?._id)}>
                                                        <GoTrash className="text-[rgba(0,0,0,0.7)] text-[14px] md:text-[18px] " />
                                                    </Button>
                                                </div>
                                            </TableCell>

                                        </TableRow>
                                    )
                                })
                            }





                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={totalBlogs || blogData?.length || 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </div>


            <Lightbox
                open={open}
                close={() => setOpen(false)}
                slides={photos}
            />



        </>
    )
}


