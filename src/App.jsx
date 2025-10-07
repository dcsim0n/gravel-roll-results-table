import React, { useState, useMemo } from 'react'
import { MantineProvider, Table, Title, Group, Badge, Select, Text, Container, Box, Space } from '@mantine/core'
import '@mantine/core/styles.css'
import './App.css'
import raceResults from '../race-results.json'


// Mantine Select doesn't use Option components

// Race results table columns
const columns = [
  {
    accessor: 'Place',
    title: 'Place',
    width: 80,
    sortable: true,
    // Mantine will handle sorting automatically
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
  }, 
  ...getUniqueLapNames(raceResults)
]

function getUniqueLapNames(apiResponse) {
  const lapSet = new Set(); // LapNumber -> LapName
  
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
// Transform race results data for the table - combine all result groups
const allRacers = raceResults.Results
// const allRacers = raceResults.Results.flatMap(resultGroup => 
//   resultGroup.Racers.map((racer, index) => ({
//     key: `${resultGroup.Grouping.Distance}-${index}`,
//     place: racer.Place,
//     bib: racer.Bib,
//     name: racer.Name,
//     teamName: racer.TeamName,
//     distance: racer.Distance,
//     category: racer.Category,
//     time: racer.Time,
//     difference: racer.Difference,
//     percentBack: racer.PercentBack,
//   }))
// )

function App() {

  // Get unique categories for the dropdown
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(allRacers.map(resultItem => resultItem.Grouping.Category))]
    return ['Overall', ...uniqueCategories.filter(Boolean).sort()]
  }, [])

  // Get unique distances for the dropdown
  const distances = useMemo(() => {
    const uniqueDistances = [...new Set(allRacers.map(resultItem => resultItem.Grouping.Distance))]
    return [...uniqueDistances.sort()]
  }, [])

  const [selectedCategory, setSelectedCategory] = useState('Overall')
  const [selectedDistance, setSelectedDistance] = useState(distances[0])

  // Filter data based on selected category and distance
  const filteredData = useMemo(() => {
    let filtered = allRacers
    // Filter by category
    if (selectedCategory !== "Overall"){
      filtered = filtered.filter(resultItem => (resultItem.Grouping.Category === selectedCategory) && (resultItem.Grouping.Distance === selectedDistance))
    } else {
      filtered = filtered.filter(resultItem => (resultItem.Grouping.Overall === true ) && (resultItem.Grouping.Distance === selectedDistance))
    }

    if (filtered.length > 0) {
      filtered = filtered[0]
    }

    return filtered
  }, [selectedCategory, selectedDistance])

  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
  }

  const handleDistanceChange = (value) => {
    setSelectedDistance(value)
  }
  console.log(distances)
  console.log(categories)
  console.log(filteredData)
  return (
    <MantineProvider >
      <Container size="xl" pt="md">
        <Space h="md" />
        <Title order={2}>{raceResults.RaceInfo.Name}</Title>
        <Text size="md" c="dimmed">
          {raceResults.RaceInfo.Date} • {raceResults.RaceInfo.City}, {raceResults.RaceInfo.StateOrProvince}
        </Text>
        <Text size="sm" c="dimmed" mb="lg">
          {raceResults.RaceInfo.Sport} • {raceResults.RaceInfo.CompletionState}
        </Text>
        
        <Box mb="md">
          <Group>
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
            {filteredData.Racers.map(racer => (
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
