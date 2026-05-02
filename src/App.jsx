import React, { useState, useMemo, useEffect } from 'react'
import { MantineProvider, Table, Title, Group, Badge, Select, Text, Container, Box, Space, Loader, Alert } from '@mantine/core'
import '@mantine/core/styles.css'
import './App.css'


// Mantine Select doesn't use Option components

// Helper function to get base columns (without lap times)
function getBaseColumns() {
  return [
    {
      accessor: 'Place',
      title: 'Place',
      width: 80,
      sortable: true,
    },
    {
      accessor: 'Name',
      title: 'Name',
      width: 200,
    },
    {
      accessor: 'Distance',
      title: 'Distance',
      width: 120,
      render: (distance) => (
        <Badge color="green" variant="filled">
          {distance}
        </Badge>
      ),
    },
    {
      accessor: 'Category',
      title: 'Category',
      width: 120,
      render: (category) => (
        <Badge color={category.includes('Female') ? 'pink' : 'blue'} variant="filled">
          {category}
        </Badge>
      ),
    },
    {
      accessor: 'Time',
      title: 'Time',
      width: 100,
    },
    {
      accessor: 'Difference',
      title: 'Difference',
      width: 100,
      render: (diff) => (
        <Text c={diff === '-' ? 'green' : 'red'}>
          {diff}
        </Text>
      ),
    },
    {
      accessor: 'PercentBack',
      title: '% Back',
      width: 80,
    }
  ];
}

function getUniqueLapNames(apiResponse) {
  const lapSet = new Set();

  apiResponse.Results.forEach(result => {
    result.Racers.forEach(racer => {
      racer.LapTimes?.forEach(lap => {
          racer[lap.LapName] = lap.LapTime
          lapSet.add(lap.LapName);
        });
    });
  });

  // Sort by lap number and return just the names
  return Array.from(lapSet.entries())
    .sort()
    .map(([_, name]) => ({
      accessor: name,
      title: name,
      width: 100,
    }));
}

const WEBSCORER_API_ID = "255884"
const WEBSCORER_BASE_URL = "https://www.webscorer.com/json/race"

function getRaceId() {
  const params = new URLSearchParams(window.location.search)
  return params.get('raceid')
}

function App() {
  // State for API data
  const [raceResults, setRaceResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(120)

  const raceId = getRaceId()
  const API_URL = raceId
    ? `${WEBSCORER_BASE_URL}?raceid=${raceId}&apiid=${WEBSCORER_API_ID}`
    : null

  // Fetch data from API
  useEffect(() => {
    if (!API_URL) {
      setLoading(false)
      setError('No race ID provided. Add ?raceid=<id> to the URL.')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setRaceResults(data)
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching race results:', err)
      } finally {
        setLoading(false)
      }
    }

    // Fetch immediately on mount
    fetchData()

    // Set up interval to fetch every 2 minutes (120,000 milliseconds)
    const intervalId = setInterval(() => {
      fetchData()
      setSecondsUntilRefresh(120)
    }, 120000)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [API_URL])

  // Countdown timer
  useEffect(() => {
    const countdownId = setInterval(() => {
      setSecondsUntilRefresh(prev => prev > 0 ? prev - 1 : 0)
    }, 1000)

    return () => clearInterval(countdownId)
  }, [])

  // Get all racers from results
  const allRacers = useMemo(() => {
    return raceResults?.Results || []
  }, [raceResults])

  // Get columns including lap times
  const columns = useMemo(() => {
    if (!raceResults) return getBaseColumns()
    return [...getBaseColumns(), ...getUniqueLapNames(raceResults)]
  }, [raceResults])

  // Get unique genders for the dropdown
  const genders = useMemo(() => {
    const uniqueGenders = [...new Set(allRacers.map(resultItem => resultItem.Grouping.Gender))]
    return ['All', ...uniqueGenders.filter(Boolean).sort()]
  }, [allRacers])

  // Get unique categories for the dropdown
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(allRacers.map(resultItem => resultItem.Grouping.Category))]
    return ['Overall', ...uniqueCategories.filter(Boolean).sort()]
  }, [allRacers])

  // Get unique distances for the dropdown
  const distances = useMemo(() => {
    const uniqueDistances = [...new Set(allRacers.map(resultItem => resultItem.Grouping.Distance))]
    return [...uniqueDistances.sort()]
  }, [allRacers])

  const [selectedGender, setSelectedGender] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('Overall')
  const [selectedDistance, setSelectedDistance] = useState(distances[0])

  // Update selected distance when distances change
  useEffect(() => {
    if (distances.length > 0 && !selectedDistance) {
      setSelectedDistance(distances[0])
    }
  }, [distances, selectedDistance])

  // Filter data based on selected category, distance, and gender
  const filteredData = useMemo(() => {
    let filtered = allRacers

    // Filter by gender first
    if (selectedGender !== 'All') {
      filtered = filtered.filter(resultItem => resultItem.Grouping.Gender === selectedGender)
    }

    // Then filter by category and distance
    if (selectedCategory !== "Overall"){
      filtered = filtered.filter(resultItem => (resultItem.Grouping.Category === selectedCategory) && (resultItem.Grouping.Distance === selectedDistance))
    } else {
      filtered = filtered.filter(resultItem => (resultItem.Grouping.Overall === true ) && (resultItem.Grouping.Distance === selectedDistance))
    }

    if (filtered.length > 0) {
      filtered = filtered[0]
    }

    return filtered
  }, [selectedCategory, selectedDistance, selectedGender, allRacers])

  const handleGenderChange = (value) => {
    setSelectedGender(value)
  }

  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
  }

  const handleDistanceChange = (value) => {
    setSelectedDistance(value)
  }

  // Loading state
  if (loading) {
    return (
      <MantineProvider>
        <Container size="xl" pt="md">
          <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Loader size="xl" />
          </Box>
        </Container>
      </MantineProvider>
    )
  }

  // Error state
  if (error) {
    return (
      <MantineProvider>
        <Container size="xl" pt="md">
          <Alert color="red" title="Error loading race results">
            {error}
          </Alert>
        </Container>
      </MantineProvider>
    )
  }

  // No data state
  if (!raceResults) {
    return (
      <MantineProvider>
        <Container size="xl" pt="md">
          <Alert color="yellow" title="No data">
            No race results available.
          </Alert>
        </Container>
      </MantineProvider>
    )
  }

  // Format countdown as MM:SS
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <MantineProvider >
      <Container size="xl" pt="md">
        <Space h="md" />
        <Title order={2}>{raceResults.RaceInfo.Name}</Title>
        <Text size="md" c="dimmed">
          {raceResults.RaceInfo.Date} • {raceResults.RaceInfo.City}, {raceResults.RaceInfo.StateOrProvince}
        </Text>
        <Text size="sm" c="dimmed">
          {raceResults.RaceInfo.Sport} • {raceResults.RaceInfo.CompletionState}
        </Text>
        <Text size="sm" c="blue" fw={500} mb="lg">
          Next update in: {formatCountdown(secondsUntilRefresh)}
        </Text>
        
        <Box mb="md">
          <Group>
            <Group>
              <Text fw={500}>Filter by Gender:</Text>
              <Select
                value={selectedGender}
                onChange={handleGenderChange}
                data={genders.map(gender => ({ value: gender, label: gender }))}
                w={150}
                placeholder="Select gender"
              />
            </Group>
            <Group>
              <Text fw={500}>Filter by Distance:</Text>
              <Select
                value={selectedDistance}
                onChange={handleDistanceChange}
                data={distances.map(distance => ({ value: distance, label: distance }))}
                w={180}
                placeholder="Select distance"
              />
            </Group>
            <Group>
              <Text fw={500}>Filter by Category:</Text>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                data={categories.map(category => ({ value: category, label: category }))}
                w={200}
                placeholder="Select category"
              />
            </Group>
          </Group>
        </Box>

        <Table>
          <Table.Thead>
            <Table.Tr>
              {columns.map(column=><Table.Th key={column.accessor}>{column.title}</Table.Th>)}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(filteredData?.Racers || []).map(racer => (
              <Table.Tr key={racer.Bib}>
                {columns.map(column => (
                  <Table.Td key={column.accessor}>{racer[column.accessor]}</Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Container>
    </MantineProvider>
  )
}

export default App
