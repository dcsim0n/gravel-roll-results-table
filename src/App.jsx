import React, { useState, useMemo } from 'react'
import { Table, Typography, Space, Tag, Select } from 'antd'
import 'antd/dist/reset.css'
import './App.css'
import raceResults from '../race-results.json'

const { Title } = Typography
const { Option } = Select

// Race results table columns
const columns = [
  {
    title: 'Place',
    dataIndex: 'place',
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
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: 'Team/City',
    dataIndex: 'teamName',
    key: 'teamName',
    width: 180,
  },
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    width: 120,
    render: (category) => (
      <Tag color={category.includes('Female') ? 'pink' : 'blue'}>
        {category}
      </Tag>
    ),
  },
  {
    title: 'Time',
    dataIndex: 'time',
    key: 'time',
    width: 100,
  },
  {
    title: 'Difference',
    dataIndex: 'difference',
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

// Transform race results data for the table
const allRacers = raceResults.Results[0].Racers.map((racer, index) => ({
  key: index.toString(),
  place: racer.Place,
  bib: racer.Bib,
  name: racer.Name,
  teamName: racer.TeamName,
  category: racer.Category,
  time: racer.Time,
  difference: racer.Difference,
  percentBack: racer.PercentBack,
}))

function App() {
  const [selectedCategory, setSelectedCategory] = useState('Overall')

  // Get unique categories for the dropdown
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(allRacers.map(racer => racer.category))]
    return ['Overall', ...uniqueCategories.sort()]
  }, [])

  // Filter data based on selected category
  const filteredData = useMemo(() => {
    if (selectedCategory === 'Overall') {
      return allRacers
    }
    return allRacers.filter(racer => racer.category === selectedCategory)
  }, [selectedCategory])

  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
  }
  return (
    <div style={{ padding: '24px' }}>
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
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData}
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
    </div>
  )
}

export default App
