import React from 'react';
import { useMemesData } from '../hooks/useMemesData';
import { SettingOutlined } from '@ant-design/icons'
import { Table, Popover } from 'antd'

const Explore = () => {
    const { isLoading, data } = useMemesData();
    if (isLoading) {
        return <div className='loadingContainer'>
            <SettingOutlined spin/>
        </div>
    }

    if (!data) {
        return <div className='loadingContainer'>
            Error while loading the data
        </div>
    }

    const columns = [
        {
            title: 'Preview',
            dataIndex: 'filename',
            key: 'filename',
            width: 25,
            render: (text, record, index) => {
                return <Popover placement="right" content={<div className='popoverpreviewContainer'><img src={text} /></div>} trigger="hover">
                    <div className='previewContainer'>
                        <img src={text} />
                    </div>
                </Popover>
            } 
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name > b.name
        },
        {
            title: 'Cluster',
            dataIndex: 'cluster',
            key: 'cluster',
            defaultSortOrder: 'ascend',
            sorter: (a, b) => a.cluster - b.cluster,
            width: 100
        },
        {
            title: 'Labels',
            dataIndex: 'labels',
            key: 'labels',
            render: (text, record, index) => {
                console.log('text', text);
                const subColumns = [
                    {
                        dataIndex: 0,
                        key: 0,
                        width: '50%'
                    },
                    {
                        dataIndex: 1,
                        key: 1,
                        width: '50%'
                    }
                ]
                
                return <Table showHeader={false} columns={subColumns} dataSource={text} size='small' pagination={false}/>
            }
        }
    ]

    return <Table columns={columns} dataSource={data} />
}

export default Explore;
