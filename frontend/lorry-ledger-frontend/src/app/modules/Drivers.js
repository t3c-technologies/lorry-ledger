// src/pages/drivers.js
import { useState, useEffect } from "react";
import axios from "axios";
import {
  notifyError,
  notifyInfo,
  notifySuccess,
} from "@/components/Notification";

import FilePreview from "@/components/FilePreview";

import { api } from "../../utils/api";
import { API_ENDPOINTS } from "../../utils/endpoints";

const ITEMS_PER_PAGE = 15;

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [isEditDriverModalOpen, setIsEditDriverModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);

  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

  const [isViewDriverModalOpen, setIsViewDriverModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleRowClick = (driver) => {
    setCurrentDriver(driver);
    setIsViewDriverModalOpen(true);
    setIsEditMode(false);
  };

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const [newDriver, setNewDriver] = useState({
    name: "",
    phone_number: "9894512345",
    status: "available",
    aadhar_number: "123456789011",
    license_number: "12345",
    license_expiry_date: "",
    photo: null, // important
    documents: null, // important
  });

  const resetNewDriverForm = () => {
    setNewDriver({
      name: "",
      phone_number: "",
      status: "available",
      aadhar_number: "",
      license_number: "",
      license_expiry_date: "",
      photo: null,
      documents: null,
    });
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.drivers.list, {
        page: currentPage,
        page_size: itemsPerPage, // Use dynamic value instead of ITEMS_PER_PAGE
      });
      setDrivers(response.data);
    } catch (error) {
      notifyError("Error fetching drivers");
    }
  };

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        // Close all modals
        setIsAddDriverModalOpen(false);
        setIsEditDriverModalOpen(false);
        setIsViewDriverModalOpen(false);
        setIsDeleteConfirmOpen(false);
        // Reset states if needed
        setNewDriver({ name: "", phone_number: "", status: "available" });
        setCurrentDriver(null);
        setIsEditMode(false);
      }
    };
    // Add event listener
    document.addEventListener("keydown", handleEscapeKey);
    // Cleanup function
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Sort function for table columns
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get sorted data
  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  };

  // Filter drivers based on search term
  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get sorted and filtered drivers
  const sortedAndFilteredDrivers = getSortedData(filteredDrivers);

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedAndFilteredDrivers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(
    sortedAndFilteredDrivers.length / recordsPerPage
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle driver search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Open "Add Driver" modal
  const handleAddDriverClick = () => {
    setIsAddDriverModalOpen(true);
  };

  // Open "Edit Driver" modal
  const handleEditClick = (driver) => {
    setCurrentDriver(driver);
    setNewDriver({
      name: driver.name,
      phone_number: driver.phone_number,
      status: driver.status,
    });
    setIsEditDriverModalOpen(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (driver) => {
    setCurrentDriver(driver);
    setIsDeleteConfirmOpen(true);
  };

  // Handle input changes for driver form
  const handleDriverChange = (e) => {
    const { name, value } = e.target;
    setNewDriver((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input changes
  const handleDriverFileChange = (e) => {
    const { name, files } = e.target;

    if (files.length > 0) {
      const file = files[0];

      if (name === "photo") {
        // For images, you might want to create a preview
        const previewUrl = URL.createObjectURL(file);
        setNewDriver((prev) => ({
          ...prev,
          photoFile: file,
          photoPreview: previewUrl,
        }));
      } else if (name === "documents") {
        setNewDriver((prev) => ({
          ...prev,
          documentsFile: file,
        }));
      }
    }
  };

  // Handle add driver form submission
  const handleAddDriver = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", newDriver.name);
    formData.append("phone_number", newDriver.phone_number);
    formData.append("status", newDriver.status);
    formData.append("aadhar_number", newDriver.aadhar_number); // Add more fields if needed
    formData.append("license_number", newDriver.license_number);
    formData.append("license_expiry_date", newDriver.license_expiry_date);

    // Append files only if they exist
    if (newDriver.photo) {
      formData.append("photo", newDriver.photo);
    }
    if (newDriver.documents) {
      formData.append("documents", newDriver.documents);
    }

    try {
      await api.post(API_ENDPOINTS.drivers.create, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Explicitly set header
        },
      });
      notifySuccess("Driver added successfully");
      fetchDrivers();
      setIsAddDriverModalOpen(false);
      resetNewDriverForm();
    } catch (error) {
      notifyError("Error adding driver");
    }
  };

  // Handle edit driver form submission
  // Handle edit driver form submission - works for both regular edit and view-edit modes
  const handleEditDriver = async (e, fromViewModal = false) => {
    if (e) e.preventDefault();
    if (!currentDriver) return;

    try {
      await api.put(API_ENDPOINTS.drivers.update(currentDriver.id), newDriver);
      notifyInfo("Driver updated successfully");
      await fetchDrivers();

      if (fromViewModal) {
        // If coming from view modal, just exit edit mode
        setIsEditMode(false);
      } else {
        // If coming from regular edit modal, close it
        setIsEditDriverModalOpen(false);
        setCurrentDriver(null);
        setNewDriver({ name: "", phone_number: "", status: "Available" });
      }
    } catch (error) {
      console.error("Error updating driver:", error);
      notifyError("Error updating driver");
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // If in edit mode, call the shared edit handler with fromViewModal=true
      handleEditDriver(null, true);
    } else {
      // If in view mode, close the view modal and open the edit modal instead
      setIsViewDriverModalOpen(false); // Close view modal

      // Open edit modal with current driver data
      setNewDriver({
        name: currentDriver.name,
        phone_number: currentDriver.phone_number,
        status: currentDriver.status,
      });

      // Open the regular edit modal
      setIsEditDriverModalOpen(true);
    }
  };

  // Handle delete driver
  const handleDeleteDriver = async () => {
    if (!currentDriver) return;
    try {
      await api.delete(API_ENDPOINTS.drivers.delete(currentDriver.id));
      notifyInfo("Driver deleted successfully");
      fetchDrivers();
      setIsDeleteConfirmOpen(false);
      setCurrentDriver(null);
    } catch {
      notifyError("Error updating driver");
    }
  };

  // Handle records per page change
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing records per page
  };

  // Get sort direction icon
  const getSortDirectionIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortConfig.direction === "ascending" ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Drivers</h1>
          <button
            onClick={handleAddDriverClick}
            className="bg-primary text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors hover:bg-opacity-90"
          >
            <span className="mr-1">+</span> Add Driver
          </button>
        </div>

        <div className="bg-white rounded-md shadow-md p-6">
          {/* Search Input */}
          <div className="mb-6 flex flex-wrap justify-between items-center">
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search Drivers"
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="mt-4 md:mt-0 flex items-center">
              <label className="mr-2 text-sm text-gray-600">
                Records per page:
              </label>
              <select
                value={recordsPerPage}
                onChange={handleRecordsPerPageChange}
                className="border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Drivers Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("name")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Driver Name
                      </span>
                      {getSortDirectionIcon("name")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("phone_number")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Phone Number
                      </span>
                      {getSortDirectionIcon("phone_number")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("status")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </span>
                      {getSortDirectionIcon("status")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right">
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRecords.map((driver) => (
                  <tr
                    key={driver.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(driver)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base font-medium text-gray-900">
                        {driver.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {driver.phone_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`h-3 w-3 rounded-full mr-2 ${
                            driver.status_display === "Available"
                              ? "bg-accent"
                              : driver.status_display === "On Trip"
                              ? "bg-primary"
                              : "bg-danger"
                          }`}
                        ></span>
                        <span className="text-base font-medium text-gray-900">
                          {driver.status_display}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleEditClick(driver);
                          }}
                          className="text-primary hover:text-blue-700 transition-colors"
                          title="Edit Driver"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleDeleteClick(driver);
                          }}
                          className="text-danger hover:text-red-600 transition-colors"
                          title="Delete Driver"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty state */}
            {sortedAndFilteredDrivers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-700 text-base">
                  No drivers found. Try a different search term or add a new
                  driver.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {sortedAndFilteredDrivers.length > 0 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, sortedAndFilteredDrivers.length)}{" "}
                of {sortedAndFilteredDrivers.length} entries
              </div>

              <nav className="flex items-center">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md mx-1 ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Previous
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, and pages around current page
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there are gaps
                    const showEllipsisBefore =
                      index > 0 && array[index - 1] !== page - 1;
                    const showEllipsisAfter =
                      index < array.length - 1 && array[index + 1] !== page + 1;

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsisBefore && (
                          <span className="px-3 py-1 text-gray-500">...</span>
                        )}

                        <button
                          onClick={() => paginate(page)}
                          className={`px-3 py-1 rounded-md mx-1 ${
                            currentPage === page
                              ? "bg-primary text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>

                        {showEllipsisAfter && (
                          <span className="px-3 py-1 text-gray-500">...</span>
                        )}
                      </div>
                    );
                  })}

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md mx-1 ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Add Driver Modal */}
      {isAddDriverModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Add New Driver
              </h2>
              <button
                onClick={() => setIsAddDriverModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddDriver}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Left column */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Driver Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newDriver.name}
                      onChange={handleDriverChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      value={newDriver.phone_number}
                      onChange={handleDriverChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={newDriver.status}
                      onChange={handleDriverChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                    >
                      <option value="available">Available</option>
                      <option value="on_trip">On Trip</option>
                      <option value="off_duty">Off Duty</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      name="aadhar_number"
                      value={newDriver.aadhar_number}
                      onChange={handleDriverChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>

                {/* Right column */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number
                    </label>
                    <input
                      type="text"
                      name="license_number"
                      value={newDriver.license_number}
                      onChange={handleDriverChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Expiry Date
                    </label>
                    <input
                      type="date"
                      name="license_expiry_date"
                      value={newDriver.license_expiry_date}
                      onChange={handleDriverChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Photo
                    </label>
                    <div className="w-full border border-gray-300 rounded-md overflow-hidden">
                      {newDriver.photoFile ? (
                        <div className="flex items-center justify-between p-2">
                          <span className="text-sm text-gray-700 truncate max-w-xs">
                            {newDriver.photoFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewDriver({
                                ...newDriver,
                                photoFile: null,
                                photoPreview: null,
                              });
                            }}
                            className="text-primary hover:text-primary-dark text-sm font-medium"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="file"
                            name="photo"
                            onChange={handleDriverFileChange}
                            className="sr-only"
                            accept="image/*"
                          />
                          <span className="px-4 py-2 bg-gray-100 text-gray-700">
                            Choose file
                          </span>
                          <span className="px-4 py-2 text-gray-500">
                            No file chosen
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Documents
                    </label>
                    <div className="w-full border border-gray-300 rounded-md overflow-hidden">
                      {newDriver.documentsFile ? (
                        <div className="flex items-center justify-between p-2">
                          <span className="text-sm text-gray-700 truncate max-w-xs">
                            {newDriver.documentsFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewDriver({
                                ...newDriver,
                                documentsFile: null,
                              });
                            }}
                            className="text-primary hover:text-primary-dark text-sm font-medium"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="file"
                            name="documents"
                            onChange={handleDriverFileChange}
                            className="sr-only"
                            accept=".pdf,.doc,.docx"
                          />
                          <span className="px-4 py-2 bg-gray-100 text-gray-700">
                            Choose file
                          </span>
                          <span className="px-4 py-2 text-gray-500">
                            No file chosen
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsAddDriverModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {isEditDriverModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Edit Driver
              </h2>
              <button
                onClick={() => setIsEditDriverModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditDriver}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Left column */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Driver Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newDriver.name}
                      onChange={handleDriverChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      value={newDriver.phone_number}
                      onChange={handleDriverChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={newDriver.status}
                      onChange={handleDriverChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                    >
                      <option value="available">Available</option>
                      <option value="on_trip">On Trip</option>
                      <option value="off_duty">Off Duty</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      name="aadhar_number"
                      value={newDriver.aadhar_number}
                      onChange={handleDriverChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>

                {/* Right column */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number
                    </label>
                    <input
                      type="text"
                      name="license_number"
                      value={newDriver.license_number}
                      onChange={handleDriverChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Expiry Date
                    </label>
                    <input
                      type="date"
                      name="license_expiry_date"
                      value={newDriver.license_expiry_date}
                      onChange={handleDriverChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Photo
                    </label>
                    <div className="w-full border border-gray-300 rounded-md overflow-hidden">
                      {newDriver.photoFile ? (
                        <div className="flex items-center justify-between p-2">
                          <span className="text-sm text-gray-700 truncate max-w-xs">
                            {newDriver.photoFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewDriver({
                                ...newDriver,
                                photoFile: null,
                                photoPreview: null,
                              });
                            }}
                            className="text-primary hover:text-primary-dark text-sm font-medium"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="file"
                              name="photo"
                              onChange={handleDriverFileChange}
                              className="sr-only"
                              accept="image/*"
                            />
                            <span className="px-4 py-2 bg-gray-100 text-gray-700">
                              Choose file
                            </span>
                            <span className="px-4 py-2 text-gray-500">
                              {newDriver.photo
                                ? "Current file"
                                : "No file chosen"}
                            </span>
                          </label>
                          {newDriver.photo && (
                            <a
                              href={newDriver.photo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-dark text-sm font-medium mr-4"
                            >
                              View
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Documents
                    </label>
                    <div className="w-full border border-gray-300 rounded-md overflow-hidden">
                      {newDriver.documentsFile ? (
                        <div className="flex items-center justify-between p-2">
                          <span className="text-sm text-gray-700 truncate max-w-xs">
                            {newDriver.documentsFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewDriver({
                                ...newDriver,
                                documentsFile: null,
                              });
                            }}
                            className="text-primary hover:text-primary-dark text-sm font-medium"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="file"
                              name="documents"
                              onChange={handleDriverFileChange}
                              className="sr-only"
                              accept=".pdf,.doc,.docx"
                            />
                            <span className="px-4 py-2 bg-gray-100 text-gray-700">
                              Choose file
                            </span>
                            <span className="px-4 py-2 text-gray-500">
                              {newDriver.documents
                                ? "Current file"
                                : "No file chosen"}
                            </span>
                          </label>
                          {newDriver.documents && (
                            <a
                              href={newDriver.documents}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-dark text-sm font-medium mr-4"
                            >
                              View
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setNewDriver({
                      name: "",
                      phone_number: "",
                      status: "available",
                      aadhar_number: "",
                      license_number: "",
                      license_expiry_date: "",
                      photoFile: null,
                      photoPreview: null,
                      documentsFile: null,
                    });
                    setIsEditDriverModalOpen(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Driver Modal */}
      {isViewDriverModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditMode ? "Edit Driver" : "Driver Details"}
              </h2>
              <button
                onClick={() => setIsViewDriverModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {!isEditMode ? (
              /* View Mode */
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Driver Name
                    </h3>
                    <p className="text-base font-medium text-gray-900">
                      {currentDriver?.name}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Phone Number
                    </h3>
                    <p className="text-base text-gray-900">
                      {currentDriver?.phone_number}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Status
                    </h3>
                    <div className="flex items-center">
                      <span
                        className={`h-3 w-3 rounded-full mr-2 ${
                          currentDriver?.status === "available"
                            ? "bg-accent"
                            : currentDriver?.status === "on_trip"
                            ? "bg-primary"
                            : "bg-danger"
                        }`}
                      ></span>
                      <span className="text-base font-medium text-gray-900">
                        {currentDriver?.status_display}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Aadhar Number
                    </h3>
                    <p className="text-base text-gray-900">
                      {currentDriver?.aadhar_number}
                    </p>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      License Number
                    </h3>
                    <p className="text-base text-gray-900">
                      {currentDriver?.license_number}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      License Expiry Date
                    </h3>
                    <p className="text-base text-gray-900">
                      {currentDriver?.license_expiry_date &&
                        new Date(
                          currentDriver.license_expiry_date
                        ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Photo</h3>
                    <FilePreview
                      fileUrl={currentDriver?.photo}
                      fileName={`${currentDriver?.name || "Driver"}'s Photo`}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Documents
                    </h3>
                    <FilePreview
                      fileUrl={currentDriver?.documents}
                      fileName={`${
                        currentDriver?.name || "Driver"
                      }'s Documents`}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode - Form Fields */
              <form onSubmit={handleEditDriver}>
                {/* Edit form content (unchanged) */}
                {/* ... */}
              </form>
            )}

            <div className="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                onClick={() => setIsViewDriverModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              {!isEditMode ? (
                <button
                  type="button"
                  onClick={toggleEditMode}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Edit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEditDriver}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Delete
              </h2>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete driver{" "}
                <span className="font-semibold">{currentDriver?.name}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDriver}
                className="px-4 py-2 bg-danger text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
