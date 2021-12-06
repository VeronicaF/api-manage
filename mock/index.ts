export default {
  '/api/v1/api-management/projects': [
    {
      projectId: 1,
      projectName: 'mock project'
    },
  ],
  '/api/v1/api-management/groups': [
    {
      groupId: 1,
      groupName: 'mock group'
    },
  ],
  '/api/v1/api-management/apis': [
    {
      "apiId": 1,
      "apiName": "api名称",
      "groupId": "1",
      "groupName": "分组名称",
      "projectId": "1",
      "path": "请求路径： /project/1",
      "exampleUrl": "http://127.0.0.1/api/v1/students/1",
      "requestMethod": "POST",
      "completeFlag": "False",
      "requestContentType": "application/json",
      "responseContentType": "application/json",
      "requestBody": "json字符串",
      "description": "描述",
      "createTime": "2020-09-15",    //创建时间
      "creatorIP": "192.168.0.115",    //创建人ip
      "apiParams": [
        {
          "paramId": "参数oid",
          "paramName": "参数名称",
          "paramType": "参数类型：String",
          "requiredFlag": "是否必填：true",
          "addressFlag": "是否为地址参数：true",
          "example": "1",
          "description": "描述",
        },
        {
          "paramId": "参数oid",
          "paramName": "参数名称",
          "paramType": "参数类型：String",
          "requiredFlag": "是否必填：true",
          "addressFlag": "是否为地址参数：false",
          "example": "1",
          "description": "描述",
        }
      ],
      "apiStatusCodes": [
        {
          "statusCodeId": "状态码oid",
          "statusCode": 200,
          "responseBody": "json字符串"
        },
        {
          "statusCodeId": "状态码oid",
          "statusCode": 400,
          "responseBody": "json字符串"
        }
      ]
    },
    {
      "apiId": 1,
      "apiName": "api名称",
      "groupId": "分组id",
      "groupName": "分组名称",
      "projectId": "项目id",
      "path": "请求路径： /project/1",
      "exampleUrl": "http://127.0.0.1/api/v1/students/1",
      "requestMethod": "POST",
      "completeFlag": "False",
      "requestContentType": "application/json",
      "responseContentType": "application/json",
      "requestBody": "json字符串",
      "description": "描述",
      "apiParams": [
        {
          "paramId": "参数oid",
          "paramName": "参数名称",
          "paramType": "参数类型：String",
          "requiredFlag": "是否必填：true",
          "addressFlag": "是否为地址参数：true",
          "example": "1",
          "description": "描述",
        },
        {
          "paramId": "参数oid",
          "paramName": "参数名称",
          "paramType": "参数类型：String",
          "requiredFlag": "是否必填：true",
          "addressFlag": "是否为地址参数：false",
          "example": "1",
          "description": "描述",
        }
      ],
      "apiStatusCodes": [
        {
          "statusCodeId": "状态码oid",
          "statusCode": 200,
          "responseBody": "json字符串"
        },
        {
          "statusCodeId": "状态码oid",
          "statusCode": 400,
          "responseBody": "json字符串"
        }
      ]
    }
  ],
  '/api/v1/api-management/apis/:apiId}': {
    "apiId": 1,
    "apiName": "api名称",
    "groupId": "分组id",
    "updateLog": "为啥要修改",
    "groupName": "分组名称",
    "projectId": "项目id",
    "path": "请求路径： /project/1",
    "exampleUrl": "http://127.0.0.1/api/v1/students/1",
    "requestMethod": "POST",
    "completeFlag": "False",
    "requestContentType": "application/json",
    "responseContentType": "application/json",
    "requestBody": "json字符串",
    "description": "描述",
    "createTime": "2020-09-15",    //创建时间
    "creatorIP": "192.168.0.115",    //创建人ip
    "apiParams": [
      {
        "paramId": "参数oid",
        "paramName": "参数名称",
        "paramType": "参数类型：String",
        "requiredFlag": "是否必填：true（如果是地址参数 只能是必填）",
        "addressFlag": "是否为地址参数：true",
        "example": "1",
        "description": "描述",
      },
      {
        "paramId": "参数oid",
        "paramName": "参数名称",
        "paramType": "参数类型：String",
        "requiredFlag": "是否必填：true",
        "addressFlag": "是否为地址参数：false",
        "example": "1",
        "description": "描述",
      }
    ],
    "apiStatusCodes": [
      {
        "statusCodeId": "状态码oid",
        "statusCode": 200,
        "responseBody": "json字符串"
      },
      {
        "statusCodeId": "状态码oid",
        "statusCode": 400,
        "responseBody": "json字符串"
      }
    ]
  }
}
