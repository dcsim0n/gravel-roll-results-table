import React, { useState, useMemo } from 'react'
import { ConfigProvider, Table, Typography, Space, Tag, Select, theme } from 'antd'
import 'antd/dist/reset.css'
import './App.css'
import raceResults from '../race-results.json'

const { Title } = Typography
const { Option } = Select

// Race results table columns
const columns = [
  {
    title: 'Place',
    dataIndex: 'Place',
    key: 'place',
    width: 80,
    sorter: (a, b) => parseInt(a.place) - parseInt(b.place),
  },
  {
    title: 'Bib',
    dataIndex: 'bib',
    key: 'bib',
    width: 80,
  },
  {
    title: 'Name',
    dataIndex: 'Name',
    key: 'Name',
    width: 200,
  },
  {
    title: 'Team/City',
    dataIndex: 'teamName',
    key: 'teamName',
    width: 180,
  },
  {
    title: 'Distance',
    dataIndex: 'Distance',
    key: 'Distance',
    width: 120,
    render: (distance) => (
      <Tag color="green">
        {distance}
      </Tag>
    ),
  },
  {
    title: 'Category',
    dataIndex: 'Category',
    key: 'Category',
    width: 120,
    render: (category) => (
      <Tag color={category.includes('Female') ? 'pink' : 'blue'}>
        {category}
      </Tag>
    ),
  },
  {
    title: 'Time',
    dataIndex: 'Time',
    key: 'time',
    width: 100,
  },
  {
    title: 'Difference',
    dataIndex: 'Difference',
    key: 'difference',
    width: 100,
    render: (diff) => (
      <span style={{ color: diff === '-' ? '#52c41a' : '#fa541c' }}>
        {diff}
      </span>
    ),
  },
  {
    title: '% Back',
    dataIndex: 'percentBack',
    key: 'percentBack',
    width: 80,
  },
]

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
    return ['Overall', ...uniqueCategories.sort()]
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
    <div style={{ padding: '24px' }}>
      <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}>
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
          <div>
            <Title level={2}>{raceResults.RaceInfo.Name}</Title>
            <p style={{ fontSize: '16px', color: '#666' }}>
              {raceResults.RaceInfo.Date} • {raceResults.RaceInfo.City}, {raceResults.RaceInfo.StateOrProvince}
            </p>
            <p style={{ fontSize: '14px', color: '#888' }}>
              {raceResults.RaceInfo.Sport} • {raceResults.RaceInfo.CompletionState}
            </p>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <Space size="large">
              <Space>
                <span style={{ fontSize: '16px', fontWeight: '500' }}>Filter by Category:</span>
                <Select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  style={{ width: 200 }}
                  placeholder="Select category"
                >
                  {categories.map(category => (
                    <Option key={category} value={category}>
                      {category} {category === 'Overall' ? `(${allRacers.length})` : `(${allRacers.filter(r => r.category === category).length})`}
                    </Option>
                  ))}
                </Select>
              </Space>
              
              <Space>
                <span style={{ fontSize: '16px', fontWeight: '500' }}>Filter by Distance:</span>
                <Select
                  value={selectedDistance}
                  onChange={handleDistanceChange}
                  style={{ width: 180 }}
                  placeholder="Select distance"
                >
                  {distances.map(distance => (
                    <Option key={distance} value={distance}>
                      {distance} {distance === 'All Distances' ? `(${allRacers.length})` : `(${allRacers.filter(r => r.distance === distance).length})`}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Space>
          </div>

          <Table 
            columns={columns} 
            dataSource={filteredData.Racers}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} racers`,
            }}
            bordered
            scroll={{ x: 1000 }}
            size="small"
          />
        </Space>
    </ConfigProvider>
    </div>
  )
}

export default App
