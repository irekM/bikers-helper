'use client';

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { ApiResponse, ScrapedProduct } from '@/types';

interface ScraperViewState {
  url: string;
  price: number | null;
  currency: string;
  loading: boolean;
  error: string | null;
}

export default function ScraperMvpVersion() {
  const [state, setState] = useState<ScraperViewState>({
    url: '',
    price: null,
    currency: '',
    loading: false,
    error: null,
  });

  function isValidUrl(urlString: string): boolean {
    try {
      const parsed = new URL(urlString);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  //Whole data flow in one function, because I didnt want to create a separate function
  //it was too complicated to pass states for me from few functions.

  //ask mentor here, is there andy diffrence between using async function and unnamed arrow function, 
  // because I used both below and I dont know if there is any difference in performance or something else.
  //
  async function handleTestScraper(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    //delete blank space from the beginning and end of the URL string
    const trimmedUrl = state.url.trim();

    // Clear previous result before next request.
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      price: null,
      currency: '',
    }));

    //validate the URL before making the request with unnamed arrow function

    if (!isValidUrl(trimmedUrl)) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Please provide a valid URL (http or https).',
      }));
      //early return to stop function execution and dont go to fetch
      return;
    }
    //make the request to the backend API to scrape the product data
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //send the URL to the backend in the request change/body as a JSON string without andy empty spaces
        body: JSON.stringify({ url: trimmedUrl }),
      });

      //parse response to JSON and cast it as ApiResponse<ScrapedProduct> to get the correct type for result
      const result = (await response.json()) as ApiResponse<ScrapedProduct>;


      //if http its not ok or api success true or false, then set the error state to the error message from the api or a default message and return early to stop function execution
      //results is ApiResponse<ScrapedProduct> type, so we can access the success and error properties directly
      if (!response.ok || !result.success) {
        const errorMessage = result.success
          ? 'Scraper returned an unknown error.'
          : result.error.message;

        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
        return;
      }
      //if everything is ok, set the price and currency state to the values from the result and clear 
      // the url state, if not it will be handled by the errormessage above
      setState((prev) => ({
        ...prev,
        price: result.data.price,
        currency: result.data.currency,
        url: '',
      }));
      //catch it catches any technical errors that may occur during the fetch request, such as network issues or server errors, and sets the error state to a generic message indicating that the request failed and suggests checking the internet connection.
    } catch {
      setState((prev) => ({
        ...prev,
        error: 'Request failed. Check your internet connection and try again.',
      }));
      //finally it executes always after the try and catch blocks, regardless of whether an error occurred or not. 
      // It sets the loading state to false
      setState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Scraper Test MVP
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Test one product URL and display the scraped price.
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleTestScraper}>
          <Stack spacing={2}>
            <TextField
              label="Product URL"
              placeholder="Type or paste any moto product here"
              value={state.url}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  url: e.target.value,
                }))
              }
              //disable input while loading to prevent multiple submissions
              disabled={state.loading}
              fullWidth
              required
            />

            <Button
            //click button turn on send request to the backend and turn on loading state
              type="submit"
              //styles only
              variant="contained"
              //that disables the button while loading
              disabled={state.loading}
              sx={{ minHeight: 44 }}
            >
              {/* //show loading spinner while request is in progress */}
              {state.loading ? <CircularProgress size={22} color="inherit" /> : 'Run Scraper'}
            </Button>
          </Stack>
        </Box>

        {state.error && <Alert severity="error">{state.error}</Alert>}

        {state.price !== null && !state.error && (
          <Alert severity="success">
            Scraped price: {state.price} {state.currency}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
