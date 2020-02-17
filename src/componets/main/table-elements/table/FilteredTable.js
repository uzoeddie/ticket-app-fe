import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import socketIOClient from 'socket.io-client';
import { useHistory, useParams } from 'react-router-dom';
import _ from 'lodash';

import { deleteTicket, closeTicket } from '../../../../services/ticket.service';
import Entries from '../elements/Entries';
import { apiEndPoint } from '../../../../Config';
import './Table.css';

const API_ENDPOINT = apiEndPoint();

const TABLE_HEAD = [
    'ID',
    'Fullname',
    'Subject',
    'Priority',
    'Status',
    'Created',
    'Completed',
    'Action'
];

const FilteredTable = props => {
    const socket = socketIOClient(API_ENDPOINT);

    const { tickets, entries, user } = props;
    const [tableTickets, setTableTickets] = useState(tickets);
    const [title, setTitle] = useState('');

    const history = useHistory();
    const { type, status } = useParams();

    const filterTickets = type => {
        if (status === 'all') {
            const tableEntries = tickets.slice(0, parseInt(entries, 10));
            setTableTickets(tableEntries);
            setTitle('All Tickets');
        } else if (status === 'priority') {
            const result  = _.filter(tickets, ['priority', type]);
            const tableEntries = result.slice(0, parseInt(entries, 10));
            setTableTickets(tableEntries);
            setTitle(`${type} Priority Tickets`);
        } else {
            const result  = _.filter(tickets, ['status', type]);
            const tableEntries = result.slice(0, parseInt(entries, 10));
            setTableTickets(tableEntries);
            setTitle(`${type} Tickets`);
        }
    }

    useEffect(() => {
        filterTickets(type);

        // eslint-disable-next-line
    }, [entries]);

    const deleteUserTicket = id => {
        deleteTicket(id);
        socket.emit('refresh', {});
    }

    const markUserTicket = id => {
        closeTicket(id);
        socket.emit('refresh', {});
    }

    const goBackToDashboard = () => {
        history.push('/dashboard');
    }

    return (
        <>
            <div className="row">
                <div className="col-sm-5">
                    <div onClick={() => goBackToDashboard()}>
                        <i className="fas fa-arrow-left back"></i>
                    </div>
                    <Entries />
                </div>
                <div className="col-sm-5 title">
                    <h3>{title}</h3>
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-centered mb-0" id="ticketTable">
                    <thead className="font-14 bg-light">
                        <tr>
                            {
                                TABLE_HEAD.map((tableHead, i) => 
                                    <th
                                        key={i}
                                        className="font-weight-medium"
                                    >
                                        {tableHead} &nbsp;&nbsp;
                                        <i className="fas fa-angle-down icon"></i>
                                    </th>
                                )
                            }
                        </tr>
                    </thead>
                    <tbody className="font-14">
                        {
                            tableTickets.map(ticket => 
                                <tr key={ticket._id}>
                                    <td>#{ticket.ticketId}</td>
                                    <td>{ticket.fullname}</td>
                                    <td>{ticket.subject}</td>
                                    <td>
                                        {
                                            ticket.priority === 'High' ?
                                            <span className="badge badge-danger">
                                                {ticket.priority}
                                            </span> : ticket.priority === 'Medium' ?
                                            <span className="badge badge-warning">
                                                {ticket.priority}
                                            </span> :
                                            <span className="badge badge-secondary">
                                                {ticket.priority}
                                            </span> 
                                        }
                                    </td>
                                    <td>
                                        {
                                            ticket.status === 'Open' ?
                                            <span className="badge badge-success">
                                                {ticket.status}
                                            </span>
                                            : <span className="badge badge-secondary">
                                                {ticket.status}
                                            </span>
                                        }
                                    </td>
                                    <td>{moment(ticket.created).format('DD/MM/YYYY')}</td>
                                    <td>{moment(ticket.dueDate).format('DD/MM/YYYY')}</td>
                                    <td className={
                                        user && user._id === ticket.user ? 'actions actions-bg' : 'actions'
                                    }>
                                        {
                                            
                                            user && user.role === 'Admin' ?
                                            <>
                                                <a href='#!' className="btn text-white btn-sm"
                                                    onClick={() => deleteUserTicket(ticket._id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </a>
                                                <a href='#!' 
                                                className={
                                                    ticket.status === 'Closed' ? 'btn text-white btn-sm disabled' : 'btn text-white btn-sm'
                                                }
                                                    onClick={() => markUserTicket(ticket._id)}
                                                >
                                                    <i className="fas fa-check"></i>
                                                </a>
                                            </>
                                            :
                                            <>
                                                <a href='#!' className="btn btn-sm disabled">
                                                    <i className="fas fa-trash"></i>
                                                </a>
                                                <a href='#!' className="btn btn-sm disabled">
                                                    <i className="fas fa-check"></i>
                                                </a>
                                                <a href='#!' className="btn btn-sm disabled">
                                                    <i className="fas fa-pencil-alt"></i>
                                                </a>
                                            </>

                                        }
                                        
                                    </td>
                                </tr>
                                
                            )
                        }

                    </tbody>
                </table>
            </div>
        </>
    )
}

FilteredTable.propTypes = {
    tickets: PropTypes.array.isRequired,
    entries: PropTypes.any,
    user: PropTypes.object,
}

const mapStateToProps = state => ({
    tickets: state.tickets.tickets,
    entries: state.tickets.entries,
    user: state.user
})

export default connect(
    mapStateToProps,
    {}
)(FilteredTable);
