import React from 'react'
import useSWR from 'swr';

// Services
import CourseServices from '../services/course.services';

// hooks
import useToggle from "../hooks/useToggle";

// Components
import Layout from '../components/Layout'
import { CourseListCard } from '../components/Courses/CourseListCard'
import { CreateCourseModal } from '../components/Courses/CreateCourseModal';

// icons
import { CourseListCardLoading } from '../components/Courses/CourseListCardLoading';
import { PageDescriptor } from '../components/PageDescriptor';
import useAuthStore from '../contexts/useAuthStore';


const Courses = () => {

  const token = useAuthStore(state => state.token);
  // Fetch all courses
  const { data, error } = useSWR(
    ["http://127.0.0.1:8888/api/courses/", token],
    CourseServices.getAllCourses
  );

  // useSWR built in loaders
  if (error) return <p>"An error has occurred."</p>;
  if (!data) return <p>"Loading..."</p>;

  if (data) {
    console.log(data);
  }

  return (
    <Layout meta="Course overview">

      {/** Page Descriptor */}
      <PageDescriptor
        title="Courses"
        desc="All courses are verified by 2 experts and validated by an Educado Admin. Allegedly."
      />

      {/** Page Navbar */}
      <div className="navbar bg-none mb-8 p-6">
        <div className="flex-1">
          {/** Create new courses */}
          <CreateCourseModal />
        </div>

        <div className="flex-none">
          <form className="flex flex-col md:flex-row w-3/4 md:w-full max-w-sm md:space-x-3 space-y-3 md:space-y-0 justify-center">
            <div className=" relative ">
              <input
                type="text"
                className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Looking for a course?"
              />
            </div>
            <button className="flex-shrink-0 px-4 py-2 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-200" type="submit">
              Search
            </button>
          </form>
        </div>
      </div>

      {/** Page content real data from backend */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {data ?
          <>
            {data.data.map((course: any, key: number) => {
              return <CourseListCard course={course} key={key} />
            })}
          </> :
          <>
            {[...Array(8)].map((_, key) => {
              return <CourseListCardLoading key={key} />
            })}
          </>
        }
      </div>
    </Layout>
  )
}

export default Courses

