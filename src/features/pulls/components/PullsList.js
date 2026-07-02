// src/components/PullsList.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PullCard from './PullCard';

const PullsList = () => {
  const [pulls, setPulls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchPulls = useCallback(async (page) => {
    const url = `${process.env.REACT_APP_API_URL}/pulls/?page=${page}`

    setLoading(true);
    console.log(`Fetching pulls from: ${url}`);

    try {
      const response = await axios.get(url);
      console.log('API Response:', response.data);
      setPulls(prevPulls => 
        page === 1 ? response.data.results : [...prevPulls, ...response.data.results]
      );
      setHasMore(response.data.next !== null);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching pulls:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPulls(1);
  }, [fetchPulls]);

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchPulls(currentPage + 1);
    }
  };

  return (
    <div className="">
      <div className="">
        {pulls.map((pull) => (
          <PullCard key={pull.id_pull} pull={pull} />
        ))}
      </div>
      {loading && <p className="text-center mt-4">Loading...</p>}
      {hasMore && !loading && (
        <button
          onClick={loadMore}
          className="mt-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 mx-auto block"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default PullsList;