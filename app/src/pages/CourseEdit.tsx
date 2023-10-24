import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useForm, SubmitHandler } from 'react-hook-form'
import { toast } from 'react-toastify'
import useSWR from 'swr'


// Hooks
import useToken from '../hooks/useToken'

// Interfaces
import { StorageFile } from '../interfaces/File'

// Services
import CourseServices from '../services/course.services'
import StorageService from '../services/storage.services'

// Pages
import NotFound from './NotFound'

// components
import Loading from './Loading'
import Layout from '../components/Layout'
import { SectionList } from '../components/dnd/SectionList'
import { SectionForm } from '../components/dnd/SectionForm'

// Icons
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { boolean } from 'yup';

import { BACKEND_URL } from "../helpers/environment";

interface Inputs {
  coverImg?: FileList
  title: string
  description: string
  category: string
  level: string
  estimatedHours: number
  published: boolean
}

// Hardcoded based on database id
const OTHER_CATEGORY_ID = '639208a0f467689fde25b5fa';


/**
 * This page is responsible for showing and editing courses to the creator.
 *
 * @returns HTML Element
 */
const CourseEdit = () => {
  const token = 'dummyToken'
  // const token = useToken();
  const { id } = useParams() // Get path params
  //const { mutate } = useSWRConfig();

  /**
     * FIX LATER: removed cover image since it has not been implemented to work yet
     */
  const [coverImg, setCoverImg] = useState<File | null>()
  const [coverImgPreview, setCoverImgPreview] = useState<string>('')

  // Fetch Course Details
  const { data, error } = useSWR(
    token ? [`${BACKEND_URL}/api/courses/${id}`, token] : null,
    CourseServices.getCourseDetail
  )

  // Fetch Categories
  const { data: categories, error: categoriesError } = useSWR(
    token ? [`${BACKEND_URL}/api/categories`, token] : null,
    CourseServices.getCourseCategories
  )

  // React useForm setup
  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>()

  /**
     * Handles the form submission for updating a course's details.
     * @param {Inputs} data - The form data containing the updated course details.
     */
    const onSubmit: SubmitHandler<Inputs> = (data) => {
        const changes: Inputs = {
        coverImg: data.coverImg,
        title: data.title,
        description: data.description,
        category: data.category,
        level: data.level,
        published: data.published,
        estimatedHours: data.estimatedHours
    }

    /** TODO: Reimplement when buckets have been implemented */
    /* if (coverImg) {
            changes.coverImg = {
                path: `${id}/coverImg`,
                filename: coverImg.name,
                size: coverImg.size,
                type: coverImg.type
            }
        } */

    // Update course details
    CourseServices.updateCourseDetail(changes, id/*, token */)
      .then(res => toast.success('Updated course'))
      .catch(err => toast.error(err))
    }

     /**
     * Delete courses and redirect to courses page
     * Uses window.location.href to redirect instead of navigate, as navigate doesn't update the page
     * 
     * @param id The course id
     * @param token The user token
     */
     const deleteCourse = async () => {
        const response = await CourseServices.deleteCourse(id, token);
        const status = response.status

        if (status >= 200 && status <= 299) {
            //mutate(`courses`)
            toast.success("Course deleted")
        } else if (status >= 400 && status <= 599) {
            toast.error(`(${status}, ${response.statusText}) while attempting to delete course`)
        }
    }

    
  // TODO: update cover image function
  /**
   * Sets the cover image preview and the cover image file
   * Though bucket is not implemented yet, so most of this is commented out
   */
  const onCoverImgChange = async (e: any) => {
    const image = 'https://www.shutterstock.com/image-illustration/red-stamp-on-white-background-260nw-1165179109.jpg'
    // const image = e.target.files[0];

    // Enables us to preview the image file before storing it
    setCoverImgPreview(image)
    // setCoverImgPreview(URL.createObjectURL(image));
    /* setCoverImg(image);

        try {
            await StorageService.uploadFile({ file: image, key: `${data.id}/coverImg` })
            toast.success('Image uploaded successfully');
        } catch (error) {
            toast.error('Image could not be uploaded, try again.');
        } */
  }

  if (error /* || categoriesError */) return <NotFound />
  if (!data /* || !categories || (!data && !categories) */) return <Loading/>

  return (
        <Layout meta={`Course: ${id}`}>

            {/** Course navigation */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="navbar bg-base-100 ">
                    <div className='flex-1'>
                        <Link to="/courses" className="btn btn-square btn-ghost normal-case text-xl"><ArrowLeftIcon width={24} /></Link>
                        <a className="normal-case text-xl ml-4">{data.title}</a>
                    </div>                    
                    <div className="flex-none space-x-2">
                    <button type="button" onClick={deleteCourse} className='left-0 std-button bg-warning hover:bg-red-800 ml-4' >Excluir</button> {/*Delete button*/}
                        {/* <button onClick={() => toast.success("Course published")} className='btn btn-sm bg-blue-500 text-white border-0'>Unpublish</button> */}
                        <button type="submit" className='std-button  text-white border-0'>Atualizar</button>
                       
                    </div>
                    
                </div>

                {/** Course details edit */}
                <div className="container mx-auto flex flex-row space-x-4 my-6">
                    <div className='w-full max-w-5xl mx-auto bg-white rounded p-6'>
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                            <div className='flex flex-col space-y-6 divide'>
                                <h1 className='text-xl font-medium'>Detalhes do curso</h1> {/* Course details */} 

                               

                                {/** Course Title Field */}
                                <div className="flex flex-col space-y-2">
                                    <label htmlFor='title'>Título</label>
                                    <input type="text" defaultValue={data.title} placeholder={data.title}
                                        className="form-field focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                        {...register('title', { required: true })}
                                    />
                                    {errors.title && <span>Este campo é obrigatório!</span>}
                                </div>

                                {/** Course Description Field */}
                                <div className="flex flex-col space-y-2">
                                    <label htmlFor='description'>Descrição</label>
                                    <textarea rows={4} defaultValue={data.description} placeholder={data.description}
                                        className="resize-none form-field focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                        {...register('description', { required: true })}
                                    />
                                    {errors.description && <span>Este campo é obrigatório!</span>}
                                </div>

                                    {/* Field to choose a category from a list of options */}
                                <div className="flex flex-col space-y-2 text-left">
                                    <label htmlFor='category'>Categoria</label>
                                    <select defaultValue={data.category}
                                        className="form-field focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        {...register('category', { required: true })}
                                    >
                                        {/* Hard coded options by PO, should be changed to get from db */}
                                        <option>Finanças pessoais </option> {/* Personal Finance */}
                                        <option>Saúde e Segurança no Trabalho </option> {/* Health and Workplace Safety */}
                                        <option>Costura </option> {/* Sewing */}
                                        <option>Eletrônica </option> {/* Electronics */}
                                    </select>
                                    {errors.description && <span className='text-warning'>Este campo é obrigatório</span>}
                                </div>

                                {/* Field to select a level from a list of options */}
                                <div className="flex flex-col space-y-2 text-left">
                                    <label htmlFor='level'>Nível</label> {/* Level */}
                                    <select defaultValue={data.level}
                                        className="small-form-field focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        {...register('level', { required: true })}
                                    >
                                        {/* Hard coded options by PO, should be changed to get from db */}
                                        <option>Iniciante </option> {/* Beginner */}
                                        <option>Intermediário</option> {/* Intermediate */}
                                        <option>Avançado </option> {/* Advanced */}

                                    </select>
                                    {errors.description && <span className='text-warning'>Este campo é obrigatório</span>}
                                </div>

                                {/* Field to input the estimated estimatedHours */}
                                <div className="flex flex-col space-y-2 text-left">
                                    <label htmlFor='title'>Tempo estimado</label> {/* Estimated time */}
                                    <input type="number" defaultValue={data.estimatedHours} min={0} step={1}
                                        className="form-field focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        {...register('estimatedHours', { required: true })}
                                    />
                                    {errors.title && <span className='text-warning'>Este campo é obrigatório</span>}
                                </div>

                                {/** Cover Image Field */}
                                <div className="flex flex-col">
                                    <div className='relative'>
                                        <div className='p-0 rounded-b-none rounded-t border-gray-300 border-x border-t h-[240px] overflow-hidden'>
                                            {data.coverImg ?
                                                <img src={data.coverImg} alt={data.title} className="w-full h-max rounded object-cover" /> :
                                                <div className='h-full w-full oceanic-gradient flex justify-center items-center text-2xl text-white'>Sem imagem de capa</div>
                                            }

                                        </div>
                                        {/* Cover image upload */}
                                        <input type="file" accept='.jpg,.jpeg,.png'
                                            {...register('coverImg')}
                                            // onChange={onCoverImgChange}
                                            className='file-input w-full input-bordered rounded-b rounded-t-none focus:outline-none'
                                        >
                                        </input>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <div className="container mx-auto flex flex-row space-x-4 my-6">
                <div className='w-full max-w-5xl mx-auto bg-white rounded p-6'>
                    {/** Course Sections area  */}
                    <div className='flex flex-col space-y-2 divide'>
                        <h1 className='text-xl font-medium mb-4'>Seções do curso</h1>
                        <SectionForm />
                        <SectionList sections={data.sections} />
                    </div>
                </div>
            </div>

        </Layout>
  )
}

export default CourseEdit
