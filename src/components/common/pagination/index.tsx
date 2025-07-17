import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handleClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex gap-3 w-full justify-between items-center px-6 mt-5 table-pagination">
      <div className="text-sm text-dark">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-1">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => handleClick(index + 1)}
            className={` h-10 w-10 min-w-10 rounded  ${
              currentPage === index + 1
                ? 'bg-primary text-white'
                : 'bg-white text-dark'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleClick(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-5 py-3 rounded-xl font-semibold ${
            currentPage === 1 ? 'border border-[#D0D5DD] bg-[#F3F3F5] text-dark' : 'bg-primary text-white'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => handleClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-5 py-3 rounded-xl font-semibold ${
            currentPage === totalPages ? 'border border-[#D0D5DD] bg-[#F3F3F5] text-dark' : 'bg-primary text-white'
          }`}
        >
          Next
        </button>
      </div>

    </div>
  );
};

export default Pagination;
