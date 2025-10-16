# API Testing Guidance

This document provides comprehensive testing instructions for all API endpoints in the EchoWrite application.

## Prerequisites

- Backend server running on `http://localhost:5000`
- Frontend server running on `http://localhost:3000`
- Valid API credentials and test data

## Authentication Endpoints

### 1. User Registration

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "isEmailVerified": false
    },
    "message": "User registered successfully. Please check your email for verification code."
  }
}
```

**Test Cases**:
- Valid registration data
- Duplicate email address
- Invalid email format
- Missing required fields
- Weak password

### 2. User Login

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "isEmailVerified": true
    },
    "token": "jwt-token"
  }
}
```

**Test Cases**:
- Valid credentials
- Invalid email
- Invalid password
- Unverified email
- Non-existent user

### 3. Email Verification

**Endpoint**: `POST /api/auth/verify-email`

**Request Body**:
```json
{
  "userId": "user-id",
  "otp": "123456"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "isEmailVerified": true
    },
    "token": "jwt-token",
    "message": "Email verified successfully!"
  }
}
```

**Test Cases**:
- Valid OTP
- Invalid OTP
- Expired OTP
- Already used OTP
- Invalid user ID

### 4. Resend Verification

**Endpoint**: `POST /api/auth/resend-verification`

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "message": "Verification code sent successfully"
  }
}
```

### 5. Get User Profile

**Endpoint**: `GET /api/auth/profile`

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": true,
    "freeQuotaUsed": 0,
    "freeQuotaLimit": 3
  }
}
```

### 6. Update User Profile

**Endpoint**: `PUT /api/auth/profile`

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "name": "John Smith"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "name": "John Smith",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

### 7. User Logout

**Endpoint**: `POST /api/auth/logout`

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

## Chat Endpoints

### 1. Send Message

**Endpoint**: `POST /api/chat/send`

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "conversationId": "conversation-id",
  "message": "Create a post about AI technology",
  "language": "en"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "message-id",
      "content": "AI-generated post content",
      "role": "assistant",
      "tokens": 150,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Test Cases**:
- Valid message with existing conversation
- Valid message creating new conversation
- Empty message
- Message exceeding quota
- Invalid conversation ID

### 2. Get Messages

**Endpoint**: `GET /api/chat/messages/:conversationId`

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message-id",
        "content": "User message",
        "role": "user",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "message-id-2",
        "content": "AI response",
        "role": "assistant",
        "tokens": 150,
        "createdAt": "2024-01-01T00:01:00.000Z"
      }
    ]
  }
}
```

## Conversation Endpoints

### 1. Get Conversations

**Endpoint**: `GET /api/conversations`

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conversation-id",
        "title": "AI Technology Post",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:01:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1,
    "hasMore": false
  }
}
```

### 2. Create Conversation

**Endpoint**: `POST /api/conversations`

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "title": "New Conversation"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conversation-id",
      "title": "New Conversation",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 3. Update Conversation

**Endpoint**: `PUT /api/conversations/:id`

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "title": "Updated Title"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conversation-id",
      "title": "Updated Title",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:01:00.000Z"
    }
  }
}
```

### 4. Delete Conversation

**Endpoint**: `DELETE /api/conversations/:id`

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "message": "Conversation deleted successfully"
  }
}
```

## Session Endpoints

### 1. Create Session

**Endpoint**: `POST /api/sessions`

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 2. Get Session

**Endpoint**: `GET /api/sessions/:id`

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Subscription Endpoints

### 1. Get All Subscription Plans

**Endpoint**: `GET /api/subscriptions/plans`

**No authentication required**

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "plan-id-1",
        "tier": "Starter",
        "name": "Starter Plan",
        "monthlyPrice": 20.00,
        "yearlyPrice": 192.00,
        "maxMessages": 50,
        "features": [
          "50 AI-generated posts per month",
          "Multiple social media formats",
          "Basic content templates",
          "Email support"
        ],
        "isActive": true
      },
      {
        "id": "plan-id-2",
        "tier": "Professional",
        "name": "Professional Plan",
        "monthlyPrice": 40.00,
        "yearlyPrice": 384.00,
        "maxMessages": 200,
        "features": [
          "200 AI-generated posts per month",
          "Advanced content optimization",
          "Priority support"
        ],
        "isActive": true
      },
      {
        "id": "plan-id-3",
        "tier": "Business",
        "name": "Business Plan",
        "monthlyPrice": 60.00,
        "yearlyPrice": 576.00,
        "maxMessages": -1,
        "features": [
          "Unlimited AI-generated posts",
          "24/7 priority support",
          "API access"
        ],
        "isActive": true
      }
    ]
  }
}
```

**Test Cases**:
- Successfully retrieve all active plans
- Verify pricing structure
- Verify features list for each tier

**cURL Example**:
```bash
curl -X GET http://localhost:5000/api/subscriptions/plans \
  -H "Content-Type: application/json"
```

---

### 2. Get Plan by Tier

**Endpoint**: `GET /api/subscriptions/plans/:tier`

**Parameters**:
- `tier`: Plan tier (Starter, Professional, Business)

**No authentication required**

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "plan-id",
      "tier": "Professional",
      "name": "Professional Plan",
      "monthlyPrice": 40.00,
      "yearlyPrice": 384.00,
      "maxMessages": 200,
      "features": [
        "200 AI-generated posts per month",
        "Advanced content optimization",
        "Custom brand voice training",
        "Priority email support"
      ],
      "isActive": true
    }
  }
}
```

**Test Cases**:
- Valid tier name
- Invalid tier name (should return 404)
- Case sensitivity

**cURL Example**:
```bash
curl -X GET http://localhost:5000/api/subscriptions/plans/Professional \
  -H "Content-Type: application/json"
```

---

### 3. Get User Subscriptions

**Endpoint**: `GET /api/subscriptions/user`

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "activeSubscription": {
      "id": "sub-id",
      "planId": "plan-id",
      "tier": "Professional",
      "billingCycle": "monthly",
      "price": 40.00,
      "maxMessages": 200,
      "usedMessages": 45,
      "remaining": 155,
      "isActive": true,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-02-01T00:00:00.000Z",
      "stripeSubscriptionId": "sub_stripe_123"
    },
    "pastSubscriptions": [
      {
        "id": "old-sub-id",
        "tier": "Starter",
        "billingCycle": "monthly",
        "isActive": false,
        "endDate": "2023-12-31T00:00:00.000Z"
      }
    ]
  }
}
```

**Test Cases**:
- User with active subscription
- User with no subscription
- User with expired subscription
- User with multiple past subscriptions

**cURL Example**:
```bash
curl -X GET http://localhost:5000/api/subscriptions/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Create Stripe Checkout Session

**Endpoint**: `POST /api/subscriptions/create-checkout`

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "planId": "plan-id",
  "billingCycle": "monthly"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
    "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3..."
  }
}
```

**Test Cases**:
- Valid monthly subscription
- Valid yearly subscription
- Invalid plan ID (should return 404)
- Invalid billing cycle (should return validation error)
- User without authentication (should return 401)
- User already has active subscription (should handle gracefully)

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/subscriptions/create-checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "planId": "plan-id-here",
    "billingCycle": "monthly"
  }'
```

**Notes**:
- The returned `url` should be used to redirect the user to Stripe checkout
- The `sessionId` is used for payment verification later

---

### 5. Verify Checkout Session

**Endpoint**: `POST /api/subscriptions/verify-checkout`

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "new-sub-id",
      "planId": "plan-id",
      "tier": "Professional",
      "billingCycle": "monthly",
      "price": 40.00,
      "maxMessages": 200,
      "usedMessages": 0,
      "remaining": 200,
      "isActive": true,
      "startDate": "2024-01-15T10:30:00.000Z",
      "endDate": "2024-02-15T10:30:00.000Z",
      "stripeSubscriptionId": "sub_stripe_new123"
    },
    "message": "Subscription activated successfully"
  }
}
```

**Test Cases**:
- Valid paid session (should create subscription)
- Invalid session ID (should return 404)
- Unpaid session (should return error)
- Already verified session (should return existing subscription)
- Session from different user (should return 403)

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/subscriptions/verify-checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0"
  }'
```

**Notes**:
- This endpoint is called after successful Stripe checkout
- It verifies the payment and creates/activates the subscription
- Acts as a backup to webhook for payment verification

---

### 6. Stripe Webhook Handler

**Endpoint**: `POST /api/subscriptions/webhook`

**Headers**:
```
stripe-signature: t=timestamp,v1=signature
Content-Type: application/json
```

**Request Body**: (Stripe event payload)
```json
{
  "id": "evt_1234567890",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_a1b2c3d4e5f6g7h8i9j0",
      "payment_status": "paid",
      "subscription": "sub_stripe_123",
      "customer": "cus_stripe_123"
    }
  }
}
```

**Expected Response**:
```json
{
  "received": true
}
```

**Test Cases**:
- `checkout.session.completed` event
- `payment_intent.succeeded` event
- `customer.subscription.created` event
- `customer.subscription.updated` event
- `customer.subscription.deleted` event
- Invalid signature (should return 400)
- Unknown event type (should return 200 but not process)

**Testing Notes**:
- Use Stripe CLI for local webhook testing:
  ```bash
  stripe listen --forward-to localhost:5000/api/subscriptions/webhook
  stripe trigger checkout.session.completed
  ```
- Verify webhook signature is validated
- Check subscription is created/updated correctly

---

### 7. Cancel Subscription

**Endpoint**: `POST /api/subscriptions/cancel`

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "subscriptionId": "sub-id"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "message": "Subscription cancelled successfully",
    "subscription": {
      "id": "sub-id",
      "isActive": false,
      "cancelledAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Test Cases**:
- Cancel active subscription
- Cancel already cancelled subscription (should return error)
- Cancel non-existent subscription (should return 404)
- Cancel another user's subscription (should return 403)

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/subscriptions/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "subscriptionId": "sub-id-here"
  }'
```

## Testing Tools

### Using cURL

Example authentication test:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Using Postman

1. Import the API collection
2. Set up environment variables
3. Run individual requests or test suites
4. Verify responses and status codes

### Using Frontend Application

1. Register a new account
2. Verify email with OTP
3. Test chat functionality
4. Test subscription flow
5. Verify all features work end-to-end

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

Common error codes:
- `VALIDATION_ERROR` - Invalid request data
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `INTERNAL_SERVER_ERROR` - Server error

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Chat endpoints: Based on user quota
- Other endpoints: 100 requests per minute

## Security Testing

1. **Authentication**: Test with invalid/missing tokens
2. **Authorization**: Test access to other users' data
3. **Input Validation**: Test with malicious input
4. **SQL Injection**: Test with SQL injection attempts
5. **XSS**: Test with script injection attempts

## Performance Testing

1. **Load Testing**: Test with multiple concurrent users
2. **Response Times**: Verify acceptable response times
3. **Database Performance**: Monitor query performance
4. **Memory Usage**: Check for memory leaks

## Complete Testing Workflow

### Scenario 1: New User Registration to First Message

1. **Register User**
   ```bash
   POST /api/auth/register
   Body: { "email": "test@example.com", "password": "password123", "name": "Test User" }
   ```

2. **Verify Email**
   ```bash
   POST /api/auth/verify-email
   Body: { "userId": "user-id-from-registration", "otp": "123456" }
   ```

3. **Login**
   ```bash
   POST /api/auth/login
   Body: { "email": "test@example.com", "password": "password123" }
   Save the JWT token from response
   ```

4. **Create Conversation**
   ```bash
   POST /api/conversations
   Headers: Authorization: Bearer <jwt-token>
   ```

5. **Send First Message**
   ```bash
   POST /api/chat/conversations/:id/messages
   Headers: Authorization: Bearer <jwt-token>
   Body: { "content": "Create a LinkedIn post about AI in healthcare" }
   ```

6. **Check Quota**
   ```bash
   GET /api/chat/usage
   Headers: Authorization: Bearer <jwt-token>
   Should show: 2 messages remaining (out of 3 free)
   ```

---

### Scenario 2: Subscription Purchase Flow

1. **Get Available Plans**
   ```bash
   GET /api/subscriptions/plans
   ```

2. **Select Plan and Create Checkout**
   ```bash
   POST /api/subscriptions/create-checkout
   Headers: Authorization: Bearer <jwt-token>
   Body: { "planId": "plan-id", "billingCycle": "monthly" }
   Save the sessionId and redirect to url
   ```

3. **Complete Payment on Stripe**
   - Use Stripe test card: 4242 4242 4242 4242
   - Any future expiry date
   - Any CVC

4. **Verify Payment**
   ```bash
   POST /api/subscriptions/verify-checkout
   Headers: Authorization: Bearer <jwt-token>
   Body: { "sessionId": "session-id-from-step-2" }
   ```

5. **Check Active Subscription**
   ```bash
   GET /api/subscriptions/user
   Headers: Authorization: Bearer <jwt-token>
   Should show active subscription with new quota
   ```

6. **Send Messages**
   ```bash
   POST /api/chat/conversations/:id/messages
   Headers: Authorization: Bearer <jwt-token>
   Should now use subscription quota instead of free quota
   ```

---

### Scenario 3: Anonymous User Flow

1. **Create Anonymous Session**
   ```bash
   POST /api/sessions
   Save the sessionId
   ```

2. **Create Conversation (Anonymous)**
   ```bash
   POST /api/conversations
   Headers: X-Session-Id: <session-id>
   ```

3. **Send Messages (Anonymous)**
   ```bash
   POST /api/chat/conversations/:id/messages
   Headers: X-Session-Id: <session-id>
   Body: { "content": "Create a tweet about productivity" }
   ```

4. **Register Account**
   ```bash
   POST /api/auth/register
   Complete email verification
   ```

5. **Claim Anonymous Conversations**
   ```bash
   POST /api/sessions/:id/claim
   Headers: Authorization: Bearer <jwt-token>
   All anonymous conversations now belong to user account
   ```

---

### Scenario 4: Conversation Management

1. **List Conversations**
   ```bash
   GET /api/conversations
   Headers: Authorization: Bearer <jwt-token>
   ```

2. **Search Conversations**
   ```bash
   GET /api/conversations?search=linkedin&page=1&limit=10
   Headers: Authorization: Bearer <jwt-token>
   ```

3. **Rename Conversation**
   ```bash
   PATCH /api/conversations/:id
   Headers: Authorization: Bearer <jwt-token>
   Body: { "title": "LinkedIn Content Ideas" }
   ```

4. **Get Conversation Messages**
   ```bash
   GET /api/chat/conversations/:id/messages
   Headers: Authorization: Bearer <jwt-token>
   ```

5. **Delete Conversation**
   ```bash
   DELETE /api/conversations/:id
   Headers: Authorization: Bearer <jwt-token>
   ```

---

### Scenario 5: Password Reset Flow

1. **Request Password Reset**
   ```bash
   POST /api/auth/forgot-password
   Body: { "email": "test@example.com" }
   Check email for OTP
   ```

2. **Reset Password**
   ```bash
   POST /api/auth/reset-password
   Body: { "userId": "user-id", "otp": "123456", "newPassword": "newpassword123" }
   ```

3. **Login with New Password**
   ```bash
   POST /api/auth/login
   Body: { "email": "test@example.com", "password": "newpassword123" }
   ```

---

## Test Data Setup

### Create Test Users with Different Statuses:

1. **Free Trial User (No Subscription)**
   - Register new user
   - Verify email
   - Use 0-2 messages (keep some quota remaining)

2. **Active Starter Plan User**
   - Register and verify
   - Purchase Starter plan
   - Use some messages

3. **Active Professional Plan User**
   - Register and verify
   - Purchase Professional plan
   - Use some messages

4. **Active Business Plan User (Unlimited)**
   - Register and verify
   - Purchase Business plan
   - Send many messages

5. **Expired Free Trial User**
   - Register and verify
   - Use all 3 free messages
   - Try to send 4th message (should fail)

6. **User with Expired Subscription**
   - Register and verify
   - Manually update subscription end date to past in database
   - Try to send message (should fail or use free quota)

---

## Automated Testing

### Recommended Test Suite:

1. **Unit Tests**
   - Service layer methods
   - Repository methods
   - Utility functions
   - Validation schemas

2. **Integration Tests**
   - API endpoints with database
   - Authentication middleware
   - Error handling
   - Quota management

3. **End-to-End Tests**
   - Complete user registration flow
   - Full subscription purchase flow
   - Message sending and quota tracking
   - Conversation management

4. **Performance Tests**
   - Concurrent users
   - Message processing speed
   - Database query performance
   - API response times

---

## Stripe Testing Resources

### Test Cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Authentication Required**: 4000 0025 0000 3155
- **Insufficient Funds**: 4000 0000 0000 9995

### Stripe CLI Commands:
```bash
# Listen to webhooks
stripe listen --forward-to localhost:5000/api/subscriptions/webhook

# Trigger events
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
stripe trigger customer.subscription.deleted
```

### View Stripe Dashboard:
- Test Mode: https://dashboard.stripe.com/test
- View payments, subscriptions, customers, and events

---

## Common Testing Pitfalls

1. **Forgetting Authentication Headers**
   - Always include `Authorization: Bearer <token>` for protected routes
   - Or `X-Session-Id: <session-id>` for anonymous routes

2. **Not Waiting for Email OTP**
   - Check backend console logs for OTP codes during development
   - Ensure email service is properly configured

3. **Stripe Webhook Signature Failures**
   - Use Stripe CLI for local testing
   - Verify `STRIPE_WEBHOOK_SECRET` is correct
   - Check webhook signature validation

4. **Quota Not Updating**
   - Verify subscription is active
   - Check quota reset logic
   - Ensure user has correct subscription tier

5. **Session vs User Context**
   - Anonymous users use session ID
   - Authenticated users use JWT
   - Test both flows separately

---

## Performance Benchmarks

### Expected Response Times:
- Authentication: < 200ms
- Chat message: < 2000ms (depends on OpenAI)
- Conversation list: < 100ms
- Subscription check: < 50ms
- Database queries: < 50ms

### Quota Limits:
- Free tier: 3 messages
- Starter: 50 messages/month
- Professional: 200 messages/month
- Business: Unlimited

---

## Debugging Tips

1. **Enable Verbose Logging**
   - Set `NODE_ENV=development`
   - Check console for detailed logs

2. **Use Prisma Studio**
   - Run `npm run prisma:studio`
   - View and modify database records

3. **Monitor Network Requests**
   - Use browser DevTools Network tab
   - Check request/response payloads
   - Verify status codes

4. **Check Backend Health**
   - Visit `http://localhost:5000/health`
   - Verify database connection
   - Check server status

---

## Frontend Testing Guide

### Manual Frontend Testing

#### 1. User Interface Testing

**Landing Page:**
- ✅ Verify responsive design on desktop, tablet, mobile
- ✅ Test navigation links and buttons
- ✅ Verify call-to-action buttons work
- ✅ Check dark/light mode toggle
- ✅ Test hero section animations and interactions

**Authentication Pages:**
- ✅ Test registration form validation
- ✅ Test login form with valid/invalid credentials
- ✅ Test email verification flow
- ✅ Test password reset functionality
- ✅ Verify error messages display correctly
- ✅ Test form submission loading states

**Chat Interface:**
- ✅ Test message input and sending
- ✅ Verify message history display
- ✅ Test conversation sidebar functionality
- ✅ Test search and filter conversations
- ✅ Verify quota display and updates
- ✅ Test responsive chat layout

**Subscription Pages:**
- ✅ Test plan selection and comparison
- ✅ Verify pricing display (monthly/yearly)
- ✅ Test Stripe checkout integration
- ✅ Verify payment success/failure handling
- ✅ Test subscription status display

#### 2. Component Testing

**Header Component:**
- ✅ Test user authentication state display
- ✅ Verify quota counter updates
- ✅ Test navigation menu functionality
- ✅ Test user profile dropdown

**Chat Components:**
- ✅ Test MessageBubble component rendering
- ✅ Verify ChatInput form submission
- ✅ Test QuotaWidget updates
- ✅ Verify ChatSidebar conversation list

**UI Components:**
- ✅ Test Button component variants
- ✅ Verify Card component layouts
- ✅ Test Modal dialogs functionality
- ✅ Verify Form validation and error states

#### 3. State Management Testing

**Redux Store:**
- ✅ Test authentication state updates
- ✅ Verify user data persistence
- ✅ Test conversation state management
- ✅ Verify subscription state updates

**RTK Query:**
- ✅ Test API data fetching
- ✅ Verify cache invalidation
- ✅ Test optimistic updates
- ✅ Verify error handling

#### 4. Navigation and Routing

**Page Navigation:**
- ✅ Test all route transitions
- ✅ Verify protected route access control
- ✅ Test browser back/forward navigation
- ✅ Verify deep linking functionality

**Route Protection:**
- ✅ Test unauthenticated access to protected routes
- ✅ Verify redirects to login page
- ✅ Test authenticated access to public routes
- ✅ Verify email verification requirement

#### 5. Performance Testing

**Loading Performance:**
- ✅ Test initial page load times
- ✅ Verify lazy loading of components
- ✅ Test image optimization
- ✅ Verify bundle size optimization

**Runtime Performance:**
- ✅ Test smooth scrolling and interactions
- ✅ Verify no memory leaks during navigation
- ✅ Test large conversation lists
- ✅ Verify efficient re-rendering

#### 6. Cross-Browser Testing

**Desktop Browsers:**
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

**Mobile Browsers:**
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Mobile responsive design
- ✅ Touch interactions

#### 7. Accessibility Testing

**Keyboard Navigation:**
- ✅ Test tab navigation through forms
- ✅ Verify focus indicators
- ✅ Test keyboard shortcuts
- ✅ Verify skip links functionality

**Screen Reader Support:**
- ✅ Test ARIA labels and descriptions
- ✅ Verify semantic HTML structure
- ✅ Test form error announcements
- ✅ Verify dynamic content updates

#### 8. Error Handling Testing

**Network Errors:**
- ✅ Test offline functionality
- ✅ Verify API error display
- ✅ Test retry mechanisms
- ✅ Verify graceful degradation

**User Input Errors:**
- ✅ Test form validation errors
- ✅ Verify error message clarity
- ✅ Test error recovery flows
- ✅ Verify user guidance

### Frontend Testing Tools

#### Browser Developer Tools
```javascript
// Test API responses in Network tab
// Check Console for errors
// Verify localStorage/sessionStorage
// Test responsive design in Device toolbar
```

#### React Developer Tools
```javascript
// Inspect component state
// Monitor props changes
// Debug Redux store
// Profile component performance
```

#### Testing Libraries (Recommended Setup)
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom

# Example test structure:
src/
  components/
    __tests__/
      Button.test.tsx
      ChatInput.test.tsx
  pages/
    __tests__/
      login.test.tsx
      chat.test.tsx
```

#### Example Component Test
```javascript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Frontend Testing Checklist

#### Pre-Testing Setup
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Database seeded with test data
- [ ] Stripe test mode enabled
- [ ] Email service configured

#### Core Functionality Tests
- [ ] User registration and email verification
- [ ] User login and authentication
- [ ] Chat message sending and receiving
- [ ] Conversation creation and management
- [ ] Subscription plan selection and purchase
- [ ] Profile management and updates
- [ ] Password reset functionality

#### UI/UX Tests
- [ ] Responsive design across devices
- [ ] Dark/light mode switching
- [ ] Loading states and animations
- [ ] Error message display
- [ ] Form validation feedback
- [ ] Navigation and routing

#### Integration Tests
- [ ] API integration with backend
- [ ] Stripe payment processing
- [ ] Email verification flow
- [ ] Real-time chat functionality
- [ ] State persistence across sessions

#### Performance Tests
- [ ] Page load times under 3 seconds
- [ ] Smooth scrolling and interactions
- [ ] Efficient memory usage
- [ ] Optimized bundle size
- [ ] Lazy loading implementation

#### Security Tests
- [ ] Protected route access control
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secure token handling
- [ ] Input sanitization

## Support

For detailed implementation, refer to:
- **README.md** - Setup and configuration
- **RENDER_DEPLOYMENT_GUIDE.md** - Production deployment
- **TESTING_GUIDANCE.md** - This comprehensive testing guide